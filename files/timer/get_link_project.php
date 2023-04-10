<?php

    $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_ID'] . '"';
    $result = $mysqli->query($select);

    if (!$result->num_rows) $result = '';
    else $result = $result->fetch_assoc();

    echo json_encode($result['link_project']);
