<?php

    $sum = 0;

    foreach ($_POST['IDs'] as $ID) {
        $select = 'SELECT * FROM billing_timer WHERE id = "' . $ID . '"';
        $result = $mysqli->query($select)->fetch_assoc();
        $sum += (int) $result['price'];
    }

    echo json_encode($sum);
