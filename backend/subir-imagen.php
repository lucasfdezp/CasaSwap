<?php

header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a preflight OPTIONS y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$carpeta = __DIR__ . '/uploads/';

// Crear carpeta uploads si no existe
if (!is_dir($carpeta)) {
    mkdir($carpeta, 0755, true);
}

// Comprobar que se ha enviado un archivo
if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    print '{"result":"FAIL","error":"No se recibió ningún archivo o hubo un error en la subida."}';
    exit();
}

$archivo  = $_FILES['imagen'];
$nombreOriginal = $archivo['name'];
$extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));

// Solo permitir imágenes
$extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($extension, $extensionesPermitidas)) {
    http_response_code(400);
    print '{"result":"FAIL","error":"Formato no permitido. Usa JPG, PNG, GIF o WEBP."}';
    exit();
}

// Tamaño máximo: 5 MB
$maxBytes = 5 * 1024 * 1024;
if ($archivo['size'] > $maxBytes) {
    http_response_code(400);
    print '{"result":"FAIL","error":"La imagen supera el tamaño máximo de 5 MB."}';
    exit();
}

// Generar nombre único para evitar colisiones
$nombreUnico = uniqid('casa_', true) . '.' . $extension;
$rutaDestino = $carpeta . $nombreUnico;

if (move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
    $urlPublica = 'http://localhost/casaswap/uploads/' . $nombreUnico;
    print json_encode(['result' => 'OK', 'url' => $urlPublica]);
} else {
    http_response_code(500);
    print '{"result":"FAIL","error":"No se pudo guardar el archivo en el servidor."}';
}
?>
