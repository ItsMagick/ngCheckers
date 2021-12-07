//basically stores text in a .txt file and if changed applys to the score.txt

<?php
$myData = "score.txt";
if(isset($_POST['score'])){
    $newData = nl2br(htmlspecialchars($_POST['score']));
    $handle = fopen($myData, "w");
    fwrite($handle,$newData);
    fclose($handle);
}
?>

<?php
if(file_exists($myData)){
    $data = file_get_contents($myData);
}
?>
<form action=scoreService.php" method="post">
    <textarea name="score" cols ="64" rows="10"> <?php echo $data; ?> </textarea>
</form>
