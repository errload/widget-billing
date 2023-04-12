<?php

    $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_ID'] . '"';
    $result = $mysqli->query($select);

    if (!$result->num_rows) {
        $insert = '
        INSERT INTO billing_deposit 
            VALUES(
                null, 
                "' . $_POST['essence_ID'] . '", 
                0, 
                "' . $_POST['link_project'] . '"
            )
        ';

        $mysqli->query($insert);
        $result = $mysqli->query($select);
    }

    $update = '
        UPDATE billing_deposit 
        SET link_project = "' . $_POST['link_project'] . '" 
        WHERE essence_id = "' . $_POST['essence_ID'] . '"
    ';

    $mysqli->query($update);
    $result = $mysqli->query($select)->fetch_assoc();

    echo json_encode($result['link_project']);
