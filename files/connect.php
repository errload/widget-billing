<?php

    $hostname = 'https://integratorgroup.k-on.ru/phpmyadmin/';
    $username = 'n108089_andreev';
    $password = 'ZUCzh$bm5i24M#pN';
    $database = 'n108089_andreev';

    $connect = mysqli_connect($hostname, $username, $password, $database);
    if ($connect->connect_error) die($connect->connect_error);
