<?php
/**
 * Clase Modelo: capa de acceso a datos de CasaSwap.
 * Encapsula todas las consultas a la base de datos MySQL mediante PDO
 * (usuarios, casas y solicitudes) y la logica del sistema de puntos.
 */
class Modelo {

    private $pdo;

    // Establece la conexion con la base de datos al instanciar la clase
    public function __CONSTRUCT() {
        try {
            // Credenciales por variables de entorno (Railway) con
            // valores por defecto para desarrollo local (XAMPP).
            $host = getenv('DB_HOST') ?: 'localhost';
            $port = getenv('DB_PORT') ?: '3306';
            $name = getenv('DB_NAME') ?: 'casaswap';
            $user = getenv('DB_USER') ?: 'root';
            $pass = getenv('DB_PASS');
            if ($pass === false) { $pass = ''; }

            $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
            $opciones = array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4");
            $this->pdo = new PDO($dsn, $user, $pass, $opciones);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }


    // -----------------------------------------------------------------------
    //  USUARIOS
    // -----------------------------------------------------------------------

    public function ListarUsuarios() {
        try {
            $sc = "SELECT id, nombre, apellidos, email, telefono, ciudad, provincia, puntos, fecha_registro
                   FROM usuarios ORDER BY apellidos, nombre";
            $stm = $this->pdo->prepare($sc);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) { die($e->getMessage()); }
    }

    public function ObtenerUsuarioId($id) {
        try {
            $sc = "SELECT id, nombre, apellidos, email, telefono, ciudad, provincia, puntos, fecha_registro
                   FROM usuarios WHERE id = ?";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($id));
            return $stm->fetch(PDO::FETCH_OBJ);
        } catch (Exception $e) { die($e->getMessage()); }
    }

    public function ObtenerPuntos($id) {
        try {
            $stm = $this->pdo->prepare("SELECT puntos FROM usuarios WHERE id = ?");
            $stm->execute(array($id));
            $row = $stm->fetch(PDO::FETCH_ASSOC);
            return $row ? (int)$row['puntos'] : 0;
        } catch (Exception $e) { die($e->getMessage()); }
    }

    public function AnadeUsuario($data) {
        try {
            // Nuevos usuarios arrancan con 50 puntos
            $sql = "INSERT INTO usuarios (nombre, apellidos, email, telefono, ciudad, provincia, puntos, password, fecha_registro)
                    VALUES (?, ?, ?, ?, ?, ?, 50, ?, ?)";
            $this->pdo->prepare($sql)->execute(array(
                $data->nombre,
                $data->apellidos,
                $data->email,
                $data->telefono,
                $data->ciudad,
                $data->provincia,
                $data->password,
                date('Y-m-d')
            ));
            return true;
        } catch (Exception $e) { die($e->getMessage()); return false; }
    }

    public function ModificaUsuario($data) {
        try {
            $sql = "UPDATE usuarios SET
                        nombre    = ?,
                        apellidos = ?,
                        email     = ?,
                        telefono  = ?,
                        ciudad    = ?,
                        provincia = ?
                    WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array(
                $data->nombre,
                $data->apellidos,
                $data->email,
                $data->telefono,
                $data->ciudad,
                $data->provincia,
                $data->id
            ));
            return true;
        } catch (Exception $e) { die($e->getMessage()); return false; }
    }

    public function LoginUsuario($email, $password) {
        try {
            $sc = "SELECT id, nombre, apellidos, puntos FROM usuarios WHERE email = ? AND password = ?";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($email, $password));
            return $stm->fetch(PDO::FETCH_OBJ);
        } catch (Exception $e) { die($e->getMessage()); }
    }

    public function BorraUsuario($id) {
        try {
            $stm = $this->pdo->prepare("DELETE FROM usuarios WHERE id = ?");
            $stm->execute(array($id));
            return true;
        } catch (Exception $e) { die($e->getMessage()); return false; }
    }


    // -----------------------------------------------------------------------
    //  CASAS
    // -----------------------------------------------------------------------

    private function parseFotos(&$row) {
        if (isset($row['fotos']) && is_string($row['fotos'])) {
            $decoded = json_decode($row['fotos'], true);
            $row['fotos'] = is_array($decoded) ? $decoded : [];
        } elseif (!isset($row['fotos'])) {
            $row['fotos'] = [];
        }
    }

    /**
     * Calcula el valor automático en puntos de una casa según sus atributos.
     * Base por tipo + habitaciones + capacidad + extras + ciudad premium.
     */
    private function calcularPuntosBase($data) {
        $base = array('piso' => 20, 'apartamento' => 25, 'casa' => 35, 'chalet' => 50);
        $tipo = isset($data->tipo_vivienda) ? $data->tipo_vivienda : 'piso';
        $p  = isset($base[$tipo]) ? $base[$tipo] : 20;
        $p += intval($data->num_habitaciones ?? 0) * 8;
        $p += intval($data->capacidad ?? 0) * 4;
        if (!empty($data->tiene_piscina))   $p += 30;
        if (!empty($data->tiene_patio))     $p += 15;
        if (!empty($data->acepta_mascotas)) $p += 5;
        $premium = array('Madrid','Barcelona','Sevilla','Bilbao','Valencia','Málaga','San Sebastián','Donostia');
        if (isset($data->ciudad) && in_array($data->ciudad, $premium)) $p += 20;
        return $p;
    }

    /**
     * Aplica el ajuste manual del propietario sobre el valor base,
     * limitado a ±30% para que no sea arbitrario.
     */
    private function calcularValorFinal($data, $base) {
        $min = (int)round($base * 0.70);
        $max = (int)round($base * 1.30);
        $valor = isset($data->valor_puntos) && $data->valor_puntos !== null && $data->valor_puntos !== ''
                 ? intval($data->valor_puntos) : $base;
        if ($valor < $min) $valor = $min;
        if ($valor > $max) $valor = $max;
        return $valor;
    }

    public function ListarCasas() {
        try {
            $sc = "SELECT c.id, c.titulo, c.descripcion, c.direccion, c.ciudad, c.barrio, c.provincia,
                          c.tipo_vivienda, c.num_habitaciones, c.capacidad, c.disponible,
                          c.acepta_mascotas, c.tiene_piscina, c.tiene_patio,
                          c.fecha_disponible_inicio, c.fecha_disponible_fin,
                          c.puntos_base, c.valor_puntos,
                          c.imagen_url, c.fotos, c.fecha_publicacion, c.usuario_id,
                          CONCAT(u.nombre, ' ', u.apellidos) propietario
                   FROM casas c
                   INNER JOIN usuarios u ON (c.usuario_id = u.id)
                   ORDER BY c.fecha_publicacion DESC";
            $stm = $this->pdo->prepare($sc);
            $stm->execute();
            $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$row) { $this->parseFotos($row); }
            return $rows;
        } catch (Exception $e) { die($e->getMessage()); }
    }

    public function ListarCasasDisponibles() {
        try {
            $sc = "SELECT c.id, c.titulo, c.descripcion, c.direccion, c.ciudad, c.barrio, c.provincia,
                          c.tipo_vivienda, c.num_habitaciones, c.capacidad,
                          c.acepta_mascotas, c.tiene_piscina, c.tiene_patio,
                          c.fecha_disponible_inicio, c.fecha_disponible_fin,
                          c.puntos_base, c.valor_puntos,
                          c.imagen_url, c.fotos, c.fecha_publicacion, c.usuario_id,
                          CONCAT(u.nombre, ' ', u.apellidos) propietario, u.telefono telefono_propietario
                   FROM casas c
                   INNER JOIN usuarios u ON (c.usuario_id = u.id)
                   WHERE c.disponible = 1
                   ORDER BY c.provincia, c.ciudad";
            $stm = $this->pdo->prepare($sc);
            $stm->execute();
            $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$row) { $this->parseFotos($row); }
            return $rows;
        } catch (Exception $e) { die($e->getMessage()); }
    }

    public function ListarCasasUsuario($id) {
        try {
            $sc = "SELECT id, titulo, descripcion, direccion, ciudad, barrio, provincia,
                          tipo_vivienda, num_habitaciones, capacidad, disponible,
                          acepta_mascotas, tiene_piscina, tiene_patio,
                          fecha_disponible_inicio, fecha_disponible_fin,
                          puntos_base, valor_puntos,
                          imagen_url, fotos, fecha_publicacion, usuario_id
                   FROM casas WHERE usuario_id = ?
                   ORDER BY fecha_publicacion DESC";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($id));
            $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$row) { $this->parseFotos($row); }
            return $rows;
        } catch (Exception $e) { die($e->getMessage()); }
    }

    public function ObtenerCasaId($id) {
        try {
            $sc = "SELECT c.id, c.titulo, c.descripcion, c.direccion, c.ciudad, c.barrio, c.provincia,
                          c.tipo_vivienda, c.num_habitaciones, c.capacidad, c.disponible,
                          c.acepta_mascotas, c.tiene_piscina, c.tiene_patio,
                          c.fecha_disponible_inicio, c.fecha_disponible_fin,
                          c.puntos_base, c.valor_puntos,
                          c.imagen_url, c.fotos, c.fecha_publicacion, c.usuario_id,
                          CONCAT(u.nombre, ' ', u.apellidos) propietario,
                          u.email email_propietario, u.telefono telefono_propietario
                   FROM casas c
                   INNER JOIN usuarios u ON (c.usuario_id = u.id)
                   WHERE c.id = ?";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($id));
            $row = $stm->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $this->parseFotos($row);
                return (object)$row;
            }
            return null;
        } catch (Exception $e) { die($e->getMessage()); }
    }

    public function AnadeCasa($data) {
        try {
            $fotos = isset($data->fotos) && is_array($data->fotos)
                     ? json_encode($data->fotos) : '[]';
            $base  = $this->calcularPuntosBase($data);
            $valor = $this->calcularValorFinal($data, $base);
            $sql = "INSERT INTO casas (usuario_id, titulo, descripcion, direccion, ciudad, barrio, provincia,
                                       tipo_vivienda, num_habitaciones, capacidad,
                                       acepta_mascotas, tiene_piscina, tiene_patio,
                                       fecha_disponible_inicio, fecha_disponible_fin,
                                       puntos_base, valor_puntos,
                                       disponible, imagen_url, fotos, fecha_publicacion)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $this->pdo->prepare($sql)->execute(array(
                $data->usuario_id,
                $data->titulo,
                $data->descripcion ?? null,
                $data->direccion   ?? null,
                $data->ciudad,
                $data->barrio      ?? null,
                $data->provincia,
                $data->tipo_vivienda,
                $data->num_habitaciones,
                $data->capacidad,
                !empty($data->acepta_mascotas) ? 1 : 0,
                !empty($data->tiene_piscina)   ? 1 : 0,
                !empty($data->tiene_patio)     ? 1 : 0,
                !empty($data->fecha_disponible_inicio) ? $data->fecha_disponible_inicio : null,
                !empty($data->fecha_disponible_fin)    ? $data->fecha_disponible_fin    : null,
                $base,
                $valor,
                isset($data->disponible) ? $data->disponible : 1,
                $data->imagen_url  ?? null,
                $fotos,
                date('Y-m-d')
            ));
            return true;
        } catch (Exception $e) { die($e->getMessage()); return false; }
    }

    public function ModificaCasa($data) {
        try {
            $fotos = isset($data->fotos) && is_array($data->fotos)
                     ? json_encode($data->fotos) : '[]';
            $base  = $this->calcularPuntosBase($data);
            $valor = $this->calcularValorFinal($data, $base);
            $sql = "UPDATE casas SET
                        titulo                  = ?,
                        descripcion             = ?,
                        direccion               = ?,
                        ciudad                  = ?,
                        barrio                  = ?,
                        provincia               = ?,
                        tipo_vivienda           = ?,
                        num_habitaciones        = ?,
                        capacidad               = ?,
                        acepta_mascotas         = ?,
                        tiene_piscina           = ?,
                        tiene_patio             = ?,
                        fecha_disponible_inicio = ?,
                        fecha_disponible_fin    = ?,
                        puntos_base             = ?,
                        valor_puntos            = ?,
                        disponible              = ?,
                        imagen_url              = ?,
                        fotos                   = ?
                    WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array(
                $data->titulo,
                $data->descripcion ?? null,
                $data->direccion   ?? null,
                $data->ciudad,
                $data->barrio      ?? null,
                $data->provincia,
                $data->tipo_vivienda,
                $data->num_habitaciones,
                $data->capacidad,
                !empty($data->acepta_mascotas) ? 1 : 0,
                !empty($data->tiene_piscina)   ? 1 : 0,
                !empty($data->tiene_patio)     ? 1 : 0,
                !empty($data->fecha_disponible_inicio) ? $data->fecha_disponible_inicio : null,
                !empty($data->fecha_disponible_fin)    ? $data->fecha_disponible_fin    : null,
                $base,
                $valor,
                $data->disponible,
                $data->imagen_url  ?? null,
                $fotos,
                $data->id
            ));
            return true;
        } catch (Exception $e) { die($e->getMessage()); return false; }
    }

    public function BorraCasa($id) {
        try {
            $stm = $this->pdo->prepare("DELETE FROM casas WHERE id = ?");
            $stm->execute(array($id));
            return true;
        } catch (Exception $e) { die($e->getMessage()); return false; }
    }


    // -----------------------------------------------------------------------
    //  SOLICITUDES DE ALQUILER (sistema de puntos con aprobación)
    // -----------------------------------------------------------------------

    /**
     * Crea una solicitud de alquiler. Valida que el inquilino tenga puntos
     * suficientes y que no exista ya una solicitud pendiente sobre la misma casa.
     * Los puntos NO se descuentan aquí: se descuentan al aceptarse.
     */
    public function CrearSolicitud($data) {
        try {
            // Datos de la casa (coste + propietario)
            $stm = $this->pdo->prepare("SELECT usuario_id, valor_puntos, titulo FROM casas WHERE id = ?");
            $stm->execute(array($data->casa_id));
            $casa = $stm->fetch(PDO::FETCH_OBJ);
            if (!$casa) return array('result' => 'FAIL', 'error' => 'La casa no existe.');

            if ((int)$casa->usuario_id === (int)$data->inquilino_id)
                return array('result' => 'FAIL', 'error' => 'No puedes alquilar tu propia casa.');

            $coste = (int)$casa->valor_puntos;

            // Puntos del inquilino
            $puntos = $this->ObtenerPuntos($data->inquilino_id);
            if ($puntos < $coste)
                return array('result' => 'FAIL',
                             'error'  => "Necesitas $coste puntos y solo tienes $puntos.");

            // ¿Ya hay una solicitud pendiente de este inquilino sobre esta casa?
            $stm = $this->pdo->prepare(
                "SELECT id FROM solicitudes
                 WHERE casa_id = ? AND inquilino_id = ? AND estado = 'pendiente'");
            $stm->execute(array($data->casa_id, $data->inquilino_id));
            if ($stm->fetch())
                return array('result' => 'FAIL', 'error' => 'Ya tienes una solicitud pendiente para esta casa.');

            // Insertar
            $sql = "INSERT INTO solicitudes
                       (casa_id, inquilino_id, propietario_id, puntos, fecha_inicio, fecha_fin, mensaje, estado)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')";
            $this->pdo->prepare($sql)->execute(array(
                $data->casa_id,
                $data->inquilino_id,
                $casa->usuario_id,
                $coste,
                !empty($data->fecha_inicio) ? $data->fecha_inicio : null,
                !empty($data->fecha_fin)    ? $data->fecha_fin    : null,
                $data->mensaje ?? null
            ));
            return array('result' => 'OK');
        } catch (Exception $e) { return array('result' => 'FAIL', 'error' => $e->getMessage()); }
    }

    /** Solicitudes recibidas por un propietario (sobre sus casas). */
    public function ListarSolicitudesRecibidas($propietarioId) {
        try {
            $sc = "SELECT s.*, c.titulo casa_titulo, c.ciudad casa_ciudad, c.imagen_url casa_imagen,
                          CONCAT(u.nombre, ' ', u.apellidos) inquilino_nombre,
                          u.email inquilino_email, u.telefono inquilino_telefono
                   FROM solicitudes s
                   INNER JOIN casas c    ON (s.casa_id = c.id)
                   INNER JOIN usuarios u ON (s.inquilino_id = u.id)
                   WHERE s.propietario_id = ?
                   ORDER BY FIELD(s.estado,'pendiente','aceptada','rechazada','cancelada'), s.fecha_solicitud DESC";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($propietarioId));
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) { die($e->getMessage()); }
    }

    /** Solicitudes enviadas por un inquilino. */
    public function ListarSolicitudesEnviadas($inquilinoId) {
        try {
            $sc = "SELECT s.*, c.titulo casa_titulo, c.ciudad casa_ciudad, c.imagen_url casa_imagen,
                          CONCAT(u.nombre, ' ', u.apellidos) propietario_nombre
                   FROM solicitudes s
                   INNER JOIN casas c    ON (s.casa_id = c.id)
                   INNER JOIN usuarios u ON (s.propietario_id = u.id)
                   WHERE s.inquilino_id = ?
                   ORDER BY s.fecha_solicitud DESC";
            $stm = $this->pdo->prepare($sc);
            $stm->execute(array($inquilinoId));
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) { die($e->getMessage()); }
    }

    /**
     * Acepta una solicitud: transfiere los puntos del inquilino al propietario
     * (de forma atómica) y marca la casa como no disponible.
     */
    public function AceptarSolicitud($id) {
        try {
            $this->pdo->beginTransaction();

            $stm = $this->pdo->prepare("SELECT * FROM solicitudes WHERE id = ? FOR UPDATE");
            $stm->execute(array($id));
            $sol = $stm->fetch(PDO::FETCH_OBJ);

            if (!$sol || $sol->estado !== 'pendiente') {
                $this->pdo->rollBack();
                return array('result' => 'FAIL', 'error' => 'La solicitud ya no está pendiente.');
            }

            // Comprobar saldo del inquilino
            $puntosInq = $this->ObtenerPuntos($sol->inquilino_id);
            if ($puntosInq < (int)$sol->puntos) {
                $this->pdo->rollBack();
                return array('result' => 'FAIL', 'error' => 'El inquilino ya no tiene puntos suficientes.');
            }

            // Transferir puntos
            $this->pdo->prepare("UPDATE usuarios SET puntos = puntos - ? WHERE id = ?")
                      ->execute(array($sol->puntos, $sol->inquilino_id));
            $this->pdo->prepare("UPDATE usuarios SET puntos = puntos + ? WHERE id = ?")
                      ->execute(array($sol->puntos, $sol->propietario_id));

            // Marcar solicitud aceptada
            $this->pdo->prepare(
                "UPDATE solicitudes SET estado = 'aceptada', fecha_resolucion = NOW() WHERE id = ?")
                ->execute(array($id));

            // Casa no disponible mientras dura el intercambio
            $this->pdo->prepare("UPDATE casas SET disponible = 0 WHERE id = ?")
                      ->execute(array($sol->casa_id));

            // Rechazar el resto de pendientes sobre la misma casa
            $this->pdo->prepare(
                "UPDATE solicitudes SET estado = 'rechazada', fecha_resolucion = NOW()
                 WHERE casa_id = ? AND id <> ? AND estado = 'pendiente'")
                ->execute(array($sol->casa_id, $id));

            $this->pdo->commit();
            return array('result' => 'OK');
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            return array('result' => 'FAIL', 'error' => $e->getMessage());
        }
    }

    /** Rechaza una solicitud pendiente (no mueve puntos). */
    public function RechazarSolicitud($id) {
        try {
            $stm = $this->pdo->prepare(
                "UPDATE solicitudes SET estado = 'rechazada', fecha_resolucion = NOW()
                 WHERE id = ? AND estado = 'pendiente'");
            $stm->execute(array($id));
            return array('result' => $stm->rowCount() > 0 ? 'OK' : 'FAIL');
        } catch (Exception $e) { return array('result' => 'FAIL', 'error' => $e->getMessage()); }
    }

    /** Cancela una solicitud propia pendiente (la hace el inquilino). */
    public function CancelarSolicitud($id) {
        try {
            $stm = $this->pdo->prepare(
                "UPDATE solicitudes SET estado = 'cancelada', fecha_resolucion = NOW()
                 WHERE id = ? AND estado = 'pendiente'");
            $stm->execute(array($id));
            return array('result' => $stm->rowCount() > 0 ? 'OK' : 'FAIL');
        } catch (Exception $e) { return array('result' => 'FAIL', 'error' => $e->getMessage()); }
    }


}  //  class Modelo
?>
