<?php

    $select = 'SELECT * FROM billing_timer WHERE essence_id = "' . $_POST['essence_ID'] . '" AND status = "finish"';
    $results = $mysqli->query($select)->fetch_all();
    if (!count($results)) $response = [];

    foreach ($results as $result) {
        $filter_from = strtotime(date($_POST['filter_from']));
        $filter_to = strtotime(date($_POST['filter_to']));
        $created_at = strtotime(date(explode(' ', $result[9])[0]));

        if ($created_at >= $filter_from && $created_at <= $filter_to) $response[] = $result;
    }

    print_r(json_encode($response));
