<?php

    $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_ID'] . '"';
    $result = $mysqli->query($select);

    if (!$result->num_rows) $deposit = 0;
    else {
        $result = $result->fetch_assoc();
        $deposit = $result['deposit'];
    }

    echo json_encode($deposit);
