<?php
// Verificar si se recibió un archivo
if(isset($_FILES['file'])) {
    $file = $_FILES['file'];
    
    // Verificar si no hay errores
    if($file['error'] === UPLOAD_ERR_OK) {
        // Mover el archivo a la ubicación deseada
        $destination = 'usuarios_registrados.csv';
        if(move_uploaded_file($file['tmp_name'], $destination)) {
            echo json_encode(['success' => true, 'message' => 'Archivo guardado correctamente']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al guardar el archivo']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error en la carga del archivo: ' . $file['error']]);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No se recibió ningún archivo']);
}
?>
