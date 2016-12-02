Use ulu8fbsvef0qz3iv;


DROP TABLE IF EXISTS `availabletime`;
DROP TABLE IF EXISTS `meetingRequest`;
DROP TABLE IF EXISTS `meetingparticipants`;
DROP TABLE IF EXISTS `meetingrankings`;
DROP TABLE IF EXISTS `meetingsuggestions`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `users_number` varchar(50) NOT NULL,
  `user_device_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`users_number`)
)
INSERT INTO `users` VALUES ('1231564890','12345'),('3199309832',NULL),('4693889069',NULL),('5153572665',NULL);

CREATE TABLE `meetingsuggestions` (
  `meetingid` int(11) NOT NULL,
  `starttime` datetime DEFAULT NULL,
  `endtime` datetime DEFAULT NULL,
  PRIMARY KEY (`meetingid`)
)

CREATE TABLE `meetingrankings` (
  `meetingid` int(11) NOT NULL,
  `user` varchar(45) DEFAULT NULL,
  `starttime` datetime DEFAULT NULL,
  `endtime` datetime DEFAULT NULL,
  `rank` int(11) DEFAULT NULL,
  PRIMARY KEY (`meetingid`)
)

CREATE TABLE `meetingparticipants` (
  `meetingid` int(11) NOT NULL,
  `user` varchar(45) NOT NULL,
  PRIMARY KEY (`meetingid`,`user`),
  KEY `uid_idx` (`user`)
)

CREATE TABLE `meetingRequest` (
  `meeting_Id` int(11) NOT NULL AUTO_INCREMENT,
  `meetingowner` varchar(45) DEFAULT NULL,
  `participantsCount` int(11) DEFAULT NULL,
  `approvedCount` int(11) DEFAULT NULL,
  `rangeStart` datetime DEFAULT NULL,
  `rangeEnd` datetime DEFAULT NULL,
  `meetingduration` decimal(4,2) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `finalstarttime` datetime DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`meeting_Id`)
)
INSERT INTO `meetingRequest` VALUES (1,'3199309832',1,0,'2016-11-18 08:00:00','2016-11-18 08:00:00',1.00,'pending',NULL,NULL),(2,'3199309832',1,0,'2016-11-18 08:00:00','2016-11-18 08:00:00',1.00,'pending',NULL,NULL),(3,'3199309832',1,0,'2016-11-18 08:30:00','2016-11-19 14:30:00',1.00,'pending',NULL,NULL);

CREATE TABLE `availabletime` (
  `meetingid` int(11) DEFAULT NULL,
  `user` varchar(45) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  KEY `meetid_idx` (`meetingid`),
  KEY `uid_idx` (`user`),
  CONSTRAINT `meetid` FOREIGN KEY (`meetingid`) REFERENCES `meetingRequest` (`meeting_Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `uid` FOREIGN KEY (`user`) REFERENCES `users` (`users_number`) ON DELETE NO ACTION ON UPDATE NO ACTION
)