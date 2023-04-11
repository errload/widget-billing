<?php

    $select = 'SELECT * FROM billing_services';
    $results = $mysqli->query($select)->fetch_all();

    $services = [];
    foreach ($results as $result) { $services[] = $result[1]; }

    // если нет полученной записи, добавляем
    foreach ($_POST['services'] as $service) {
        if (in_array($service, $services)) continue;
        $insert = 'INSERT INTO billing_services VALUES(null, "' . $service . '")';
        $mysqli->query($insert);
    }

    // если нет существующей записи, удаляем
    foreach ($services as $service) {
        if (in_array($service, $_POST['services'])) continue;
        $delete = 'DELETE FROM billing_services WHERE title = "' . $service . '"';
        $mysqli->query($delete);
    }

    $results = $mysqli->query($select)->fetch_all();
    print_r(json_encode($results));
