-- MySQL dump 10.13  Distrib 5.7.16, for osx10.11 (x86_64)
--
-- Host: localhost    Database: Screener
-- ------------------------------------------------------
-- Server version	5.7.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Assessments`
--

DROP TABLE IF EXISTS `Assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assessments` (
  `assessmentId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `nickName` varchar(20) NOT NULL,
  `description` varchar(300) NOT NULL,
  `reg_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assessmentId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Assessments`
--

LOCK TABLES `Assessments` WRITE;
/*!40000 ALTER TABLE `Assessments` DISABLE KEYS */;
INSERT INTO `Assessments` VALUES (1,'Basic Information','assessment_1','This is used to collect basic non-identifiable information from the user','2016-11-04 04:27:18'),(2,'Audio Assessment','assessment_2','Here we collect your voice sample','2016-11-04 04:27:18'),(3,'Voice Assessment','assessment_3','Get voice of participant','2016-11-04 04:27:18'),(4,'Video Assessment','assessment_4','Here we collect your video','2016-11-04 04:27:18');
/*!40000 ALTER TABLE `Assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Questions`
--

DROP TABLE IF EXISTS `Questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Questions` (
  `questionId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `question` varchar(300) NOT NULL,
  `assessmentId` int(10) unsigned NOT NULL,
  `reg_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`questionId`),
  KEY `assessmentId` (`assessmentId`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`assessmentId`) REFERENCES `Assessments` (`assessmentId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Questions`
--

LOCK TABLES `Questions` WRITE;
/*!40000 ALTER TABLE `Questions` DISABLE KEYS */;
INSERT INTO `Questions` VALUES (1,'Provide your Date of Birth.',1,'2016-11-04 04:27:18'),(2,'What is your Gender?',1,'2016-11-04 04:27:18'),(3,'Select your Ethnicity',1,'2016-11-04 04:27:18'),(4,'Select your highest education',1,'2016-11-04 04:27:18'),(5,'Here you will listen to some audio clips. You will have to listen to the audio and repeat what you heard. Click Start to start this assessment.',2,'2016-11-04 04:27:18'),(6,'You will be provided with a letter. Please say as many words as you can starting with the letter. Click on Start Recording whenever you are ready. You will be given a 3 second countdown after which you can start saying the words.',3,'2016-11-04 04:27:18');
/*!40000 ALTER TABLE `Questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ResponseTexts`
--

DROP TABLE IF EXISTS `ResponseTexts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ResponseTexts` (
  `responseTextId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(10) unsigned NOT NULL,
  `questionId` int(10) unsigned NOT NULL,
  `response` text,
  `reg_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`responseTextId`),
  UNIQUE KEY `UNQ_userId_questionId` (`userId`,`questionId`),
  KEY `questionId` (`questionId`),
  CONSTRAINT `responsetexts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`userId`),
  CONSTRAINT `responsetexts_ibfk_2` FOREIGN KEY (`questionId`) REFERENCES `Questions` (`questionId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ResponseTexts`
--

LOCK TABLES `ResponseTexts` WRITE;
/*!40000 ALTER TABLE `ResponseTexts` DISABLE KEYS */;
/*!40000 ALTER TABLE `ResponseTexts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `userId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip` varchar(30) NOT NULL,
  `sessionId` varchar(19) NOT NULL,
  `reg_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'http://127.0.0.1:8000','1234-1234-1234-1234','2016-11-04 04:27:18'),(2,'localhost:3000','9070-6207-0505-b5d4','2016-11-04 06:29:40'),(3,'localhost:3000','faa6-d68b-460a-06cc','2016-11-04 06:31:36'),(4,'localhost:3000','8f17-e11c-2ad6-ca51','2016-11-08 04:06:18'),(5,'localhost:5000','376c-9295-4104-7020','2016-11-08 05:10:24'),(6,'localhost:5000','0412-0512-b153-93c9','2016-11-08 05:31:32');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_assessmentquestions`
--

DROP TABLE IF EXISTS `vw_assessmentquestions`;
/*!50001 DROP VIEW IF EXISTS `vw_assessmentquestions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_assessmentquestions` AS SELECT 
 1 AS `questionId`,
 1 AS `question`,
 1 AS `assessmentId`,
 1 AS `nickName`,
 1 AS `name`,
 1 AS `description`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_assessmentquestions`
--

/*!50001 DROP VIEW IF EXISTS `vw_assessmentquestions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_assessmentquestions` AS (select `q`.`questionId` AS `questionId`,`q`.`question` AS `question`,`a`.`assessmentId` AS `assessmentId`,`a`.`nickName` AS `nickName`,`a`.`name` AS `name`,`a`.`description` AS `description` from (`assessments` `a` left join `questions` `q` on((`q`.`assessmentId` = `a`.`assessmentId`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-11-08  0:39:21
