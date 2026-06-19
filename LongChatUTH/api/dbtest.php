<?php

$conn = mysqli_connect(
    "HOST",
    "USER",
    "PASS",
    "DB"
);

if($conn){
    echo "Database Connected";
}else{
    echo mysqli_connect_error();
}
?>