<?php

    $select = 'SELECT * FROM billing_services';
    $results = $mysqli->query($select)->fetch_all();

    print_r(json_encode($results));
