<?php
/**
 * servicios.php - Punto de entrada de la API.
 * Recibe peticiones POST con un JSON que incluye el campo "accion" y
 * delega la operacion correspondiente en la clase Modelo. Devuelve la
 * respuesta en formato JSON. Incluye las cabeceras CORS necesarias para
 * que el frontend (alojado en otro dominio) pueda consumir la API.
 */

header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Responder a preflight OPTIONS y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'modelos.php';
$modelo = new Modelo();

$datos  = file_get_contents('php://input');
$objeto = json_decode($datos);

// Credenciales del administrador (puedes cambiarlas aquí)
define('ADMIN_EMAIL',    'admin@casaswap.es');
define('ADMIN_PASSWORD', 'admin123');

if ($objeto != null) {
    switch ($objeto->accion) {


        // -------------------------------------------------------------------
        //  LOGIN ADMIN
        // -------------------------------------------------------------------

        case "Login":
            if ($objeto->email === ADMIN_EMAIL && $objeto->password === ADMIN_PASSWORD) {
                print '{"result":"OK","tipo":"admin","nombre":"Administrador"}';
            } else {
                print '{"result":"FAIL","error":"Email o contraseña incorrectos."}';
            }
            break;

        case "LoginUsuario":
            $u = $modelo->LoginUsuario($objeto->email, $objeto->password);
            if ($u) {
                print json_encode(['result' => 'OK', 'tipo' => 'usuario',
                                   'id' => $u->id, 'nombre' => $u->nombre . ' ' . $u->apellidos,
                                   'puntos' => (int)$u->puntos]);
            } else {
                print '{"result":"FAIL","error":"Email o contraseña incorrectos."}';
            }
            break;


        // -------------------------------------------------------------------
        //  USUARIOS — LISTAR Y OBTENER
        // -------------------------------------------------------------------

        case "ListarUsuarios":
            print json_encode($modelo->ListarUsuarios());
            break;

        case "ObtenerUsuarioId":
            print json_encode($modelo->ObtenerUsuarioId($objeto->id));
            break;

        case "ObtenerPuntos":
            print json_encode(['result' => 'OK', 'puntos' => $modelo->ObtenerPuntos($objeto->id)]);
            break;


        // -------------------------------------------------------------------
        //  USUARIOS — AÑADIR
        // -------------------------------------------------------------------

        case "AnadeUsuario":
            if ($modelo->AnadeUsuario($objeto->usuario))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;


        // -------------------------------------------------------------------
        //  USUARIOS — MODIFICAR
        // -------------------------------------------------------------------

        case "ModificaUsuario":
            if ($modelo->ModificaUsuario($objeto->usuario))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;


        // -------------------------------------------------------------------
        //  USUARIOS — BORRAR
        // -------------------------------------------------------------------

        case "BorraUsuario":
            if ($modelo->BorraUsuario($objeto->id))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;


        // -------------------------------------------------------------------
        //  CASAS — LISTAR Y OBTENER
        // -------------------------------------------------------------------

        case "ListarCasas":
            print json_encode($modelo->ListarCasas());
            break;

        case "ListarCasasDisponibles":
            print json_encode($modelo->ListarCasasDisponibles());
            break;

        case "ListarCasasUsuario":
            print json_encode($modelo->ListarCasasUsuario($objeto->id));
            break;

        case "ObtenerCasaId":
            print json_encode($modelo->ObtenerCasaId($objeto->id));
            break;


        // -------------------------------------------------------------------
        //  CASAS — AÑADIR
        // -------------------------------------------------------------------

        case "AnadeCasa":
            if ($modelo->AnadeCasa($objeto->casa))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;


        // -------------------------------------------------------------------
        //  CASAS — MODIFICAR
        // -------------------------------------------------------------------

        case "ModificaCasa":
            if ($modelo->ModificaCasa($objeto->casa))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;


        // -------------------------------------------------------------------
        //  CASAS — BORRAR
        // -------------------------------------------------------------------

        case "BorraCasa":
            if ($modelo->BorraCasa($objeto->id))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;


        // -------------------------------------------------------------------
        //  SOLICITUDES DE ALQUILER (sistema de puntos)
        // -------------------------------------------------------------------

        case "CrearSolicitud":
            print json_encode($modelo->CrearSolicitud($objeto->solicitud));
            break;

        case "ListarSolicitudesRecibidas":
            print json_encode($modelo->ListarSolicitudesRecibidas($objeto->id));
            break;

        case "ListarSolicitudesEnviadas":
            print json_encode($modelo->ListarSolicitudesEnviadas($objeto->id));
            break;

        case "AceptarSolicitud":
            print json_encode($modelo->AceptarSolicitud($objeto->id));
            break;

        case "RechazarSolicitud":
            print json_encode($modelo->RechazarSolicitud($objeto->id));
            break;

        case "CancelarSolicitud":
            print json_encode($modelo->CancelarSolicitud($objeto->id));
            break;


    }  //  switch
}  //  if
?>
