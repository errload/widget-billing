<?php

    $select = '
        SELECT * 
        FROM billing_timer 
        WHERE essence_id = "' . $_POST['essence_ID'] . '"
            AND status = "finish"
        ORDER BY id DESC
    ';

    $results = $mysqli->query($select);

    if (!$results->num_rows) $results = [];
    else $results = $results->fetch_all();

    echo json_encode($results);
