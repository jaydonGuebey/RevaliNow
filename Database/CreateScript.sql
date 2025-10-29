CREATE DATABASE IF NOT EXISTS RevaliNowDB;

USE RevaliNowDB;

SET FOREIGN_KEY_CHECKS=0;


-- === STAP 1: TABELSTRUCTUREN AANMAKEN === --
DROP TABLE IF EXISTS `Zorgverzekeraars`;
CREATE TABLE `Zorgverzekeraars` (
        `ZorgverzekeraarID` BIGINT PRIMARY KEY NOT NULL,
        `Naam` VARCHAR(255) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS `Oefeningen`;
CREATE TABLE `Oefeningen` (
        `OefeningID` BIGINT PRIMARY KEY NOT NULL,
        `Naam` VARCHAR(255) NOT NULL,
        `Beschrijving` TEXT NOT NULL,
        `InstructieVideoURL` VARCHAR(500) NULL
);

DROP TABLE IF EXISTS `Gebruikers`;
CREATE TABLE `Gebruikers` (
        `GebruikerID` BIGINT PRIMARY KEY NOT NULL,
        `Gebruikersnaam` VARCHAR(100) NOT NULL UNIQUE,
        `WachtwoordHash` VARCHAR(255) NOT NULL,
        `Rol` VARCHAR(50) NOT NULL CHECK (`Rol` IN ('Zorgverzekeraar', 'Huisarts', 'Revalidatiearts', 'Patient')),
        `Voornaam` VARCHAR(100) NOT NULL,
        `Achternaam` VARCHAR(100) NOT NULL,
        `OrganisatieID` BIGINT NULL
);

DROP TABLE IF EXISTS `Patienten`;
CREATE TABLE `Patienten` (
        `PatientID` BIGINT PRIMARY KEY NOT NULL,
        `Voornaam` VARCHAR(100) NOT NULL,
        `Achternaam` VARCHAR(100) NOT NULL,
        `Geboortedatum` DATE NOT NULL,
        `Adres` VARCHAR(255) NULL,
        `Telefoonnummer` VARCHAR(20) NULL,
        `Email` VARCHAR(255) NOT NULL UNIQUE,
        `HuisartsID` BIGINT NOT NULL
);

DROP TABLE IF EXISTS `PatientRevalidatiearts`;
CREATE TABLE `PatientRevalidatiearts` (
        `PatientRevalidatieartsID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `RevalidatieartsID` BIGINT NOT NULL
);

DROP TABLE IF EXISTS `Vergoedingsregels`;
CREATE TABLE `Vergoedingsregels` (
        `RegelID` BIGINT PRIMARY KEY NOT NULL,
        `Naam` VARCHAR(255) NOT NULL UNIQUE,
        `MaxVergoedBedrag` DECIMAL(10, 2) NOT NULL CHECK (`MaxVergoedBedrag` >= 0),
        `MaxVergoedPercentage` INT NOT NULL CHECK (`MaxVergoedPercentage` BETWEEN 0 AND 100),
        `Voorwaarden` TEXT NULL,
        `GeldigVanaf` DATE NOT NULL,
        `GeldigTot` DATE NULL,
        `Actief` TINYINT(1) NOT NULL DEFAULT 1
);

DROP TABLE IF EXISTS `Accessoires`;
CREATE TABLE `Accessoires` (
        `AccessoireID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `HuisartsID` BIGINT NULL,
        `Naam` VARCHAR(255) NOT NULL,
        `AdviesDatum` DATE NULL,
        `VerwachteGebruiksperiode` VARCHAR(100) NULL,
        `Status` VARCHAR(50) NULL
);

DROP TABLE IF EXISTS `Activiteiten_logboek`;
CREATE TABLE `Activiteiten_logboek` (
        `LogboekID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `DatumTijdActiviteit` DATETIME NOT NULL,
        `Beschrijving` TEXT NOT NULL
);

DROP TABLE IF EXISTS `Afspraken`;
CREATE TABLE `Afspraken` (
        `AfspraakID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `RevalidatieartsID` BIGINT NOT NULL,
        `DatumTijdAfspraak` DATETIME NOT NULL,
        `DuurMinuten` INT NULL,
        `TypeAfspraak` VARCHAR(100) NULL,
        `Status` VARCHAR(50) NULL
);

DROP TABLE IF EXISTS `Declaraties`;
CREATE TABLE `Declaraties` (
        `DeclaratieID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `TypeDeclaratie` VARCHAR(100) NOT NULL,
        `GedeclareerdDoorGebruikerID` BIGINT NOT NULL,
        `DatumHandeling` DATE NOT NULL,
        `Omschrijving` VARCHAR(500) NULL,
        `GedeclareerdBedrag` DECIMAL(10, 2) NOT NULL CHECK (`GedeclareerdBedrag` >= 0),
        `Status` VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS `Declaratieverwerkingen`;
CREATE TABLE `Declaratieverwerkingen` (
        `VerwerkingID` BIGINT PRIMARY KEY NOT NULL,
        `DeclaratieID` BIGINT NOT NULL,
        `ZorgverzekeraarMedewerkerID` BIGINT NOT NULL,
        `DatumVerwerking` DATETIME NOT NULL,
        `StatusVerwerking` VARCHAR(50) NOT NULL,
        `VergoedBedrag` DECIMAL(10, 2) NOT NULL CHECK (`VergoedBedrag` >= 0),
        `AfgekeurdBedrag` DECIMAL(10, 2) NOT NULL CHECK (`AfgekeurdBedrag` >= 0),
        `Toelichting` TEXT NULL
);

DROP TABLE IF EXISTS `Intakegesprekken`;
CREATE TABLE `Intakegesprekken` (
        `IntakeID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `RevalidatieartsID` BIGINT NOT NULL,
        `Diagnose` VARCHAR(500) NOT NULL,
        `ErnstBlessure` VARCHAR(100) NULL,
        `Behandeldoelen` TEXT NULL,
        `DatumIntake` DATE NOT NULL
);

DROP TABLE IF EXISTS `Medicatie`;
CREATE TABLE `Medicatie` (
        `MedicatieID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `HuisartsID` BIGINT NULL,
        `Naam` VARCHAR(255) NOT NULL,
        `Dosering` VARCHAR(100) NULL,
        `Frequentie` VARCHAR(100) NULL,
        `StartDatum` DATE NOT NULL,
        `EindDatum` DATE NULL,
        `Status` VARCHAR(50) NULL
);

DROP TABLE IF EXISTS `Notities`;
CREATE TABLE `Notities` (
        `NotitieID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `AuteurGebruikerID` BIGINT NOT NULL,
        `DatumTijdNotitie` DATETIME NOT NULL,
        `Inhoud` TEXT NOT NULL
);

DROP TABLE IF EXISTS `Oefenplannen`;
CREATE TABLE `Oefenplannen` (
        `PatientOefenplanID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `OefeningID` BIGINT NOT NULL,
        `RevalidatieartsID` BIGINT NOT NULL,
        `StartDatum` DATE NOT NULL,
        `EindDatum` DATE NULL,
        `Herhalingen` INT NOT NULL CHECK (`Herhalingen` > 0),
        `Sets` INT NOT NULL CHECK (`Sets` > 0),
        `FrequentiePerDag` INT NOT NULL CHECK (`FrequentiePerDag` > 0),
        `Opmerkingen` TEXT NULL
);

DROP TABLE IF EXISTS `Pijnindicaties`;
CREATE TABLE `Pijnindicaties` (
        `PijnIndicatieID` BIGINT PRIMARY KEY NOT NULL,
        `PatientID` BIGINT NOT NULL,
        `DatumTijdRegistratie` DATETIME NOT NULL,
        `PijnScore` INT NOT NULL CHECK (`PijnScore` BETWEEN 0 AND 10),
        `Toelichting` TEXT NULL
);

DROP TABLE IF EXISTS `Uitgevoerde_oefeningen`;
CREATE TABLE `Uitgevoerde_oefeningen` (
        `UitgevoerdeOefeningID` BIGINT PRIMARY KEY NOT NULL,
        `PatientOefenplanID` BIGINT NOT NULL,
        `DatumTijdAfgevinkt` DATETIME NOT NULL,
        `IsAfgevinkt` TINYINT(1) NOT NULL DEFAULT 1
);

SET FOREIGN_KEY_CHECKS=1;


-- === STAP 2: RELATIES LEGGEN (FOREIGN KEYS) === --
ALTER TABLE Gebruikers ADD CONSTRAINT FK_Gebruikers_Organisatie FOREIGN KEY (`OrganisatieID`) REFERENCES Zorgverzekeraars(`ZorgverzekeraarID`);
ALTER TABLE Patienten ADD CONSTRAINT FK_Patienten_Huisarts FOREIGN KEY (`HuisartsID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE PatientRevalidatiearts ADD CONSTRAINT FK_PatientRevalidatiearts_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE PatientRevalidatiearts ADD CONSTRAINT FK_PatientRevalidatiearts_Revalidatiearts FOREIGN KEY (`RevalidatieartsID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE Accessoires ADD CONSTRAINT FK_Accessoires_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE Accessoires ADD CONSTRAINT FK_Accessoires_Huisarts FOREIGN KEY (`HuisartsID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE Activiteiten_logboek ADD CONSTRAINT FK_Activiteiten_logboek_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE Afspraken ADD CONSTRAINT FK_Afspraken_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE Afspraken ADD CONSTRAINT FK_Afspraken_Revalidatiearts FOREIGN KEY (`RevalidatieartsID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE Intakegesprekken ADD CONSTRAINT FK_Intakegesprekken_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE Intakegesprekken ADD CONSTRAINT FK_Intakegesprekken_Revalidatiearts FOREIGN KEY (`RevalidatieartsID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE Medicatie ADD CONSTRAINT FK_Medicatie_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE Medicatie ADD CONSTRAINT FK_Medicatie_Huisarts FOREIGN KEY (`HuisartsID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE Notities ADD CONSTRAINT FK_Notities_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE Notities ADD CONSTRAINT FK_Notities_Auteur FOREIGN KEY (`AuteurGebruikerID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE Pijnindicaties ADD CONSTRAINT FK_Pijnindicaties_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE Oefenplannen ADD CONSTRAINT FK_Oefenplannen_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`) ON DELETE CASCADE;
ALTER TABLE Oefenplannen ADD CONSTRAINT FK_Oefenplannen_Oefening FOREIGN KEY (`OefeningID`) REFERENCES Oefeningen(`OefeningID`);
ALTER TABLE Oefenplannen ADD CONSTRAINT FK_Oefenplannen_Revalidatiearts FOREIGN KEY (`RevalidatieartsID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE Uitgevoerde_oefeningen ADD CONSTRAINT FK_Uitgevoerde_oefeningen_Oefenplan FOREIGN KEY (`PatientOefenplanID`) REFERENCES Oefenplannen(`PatientOefenplanID`) ON DELETE CASCADE;
ALTER TABLE Declaraties ADD CONSTRAINT FK_Declaraties_Patient FOREIGN KEY (`PatientID`) REFERENCES Patienten(`PatientID`);
ALTER TABLE Declaraties ADD CONSTRAINT FK_Declaraties_GedeclareerdDoor FOREIGN KEY (`GedeclareerdDoorGebruikerID`) REFERENCES Gebruikers(`GebruikerID`);
ALTER TABLE Declaratieverwerkingen ADD CONSTRAINT FK_Declaratieverwerkingen_Declaratie FOREIGN KEY (`DeclaratieID`) REFERENCES Declaraties(`DeclaratieID`) ON DELETE CASCADE;
ALTER TABLE Declaratieverwerkingen ADD CONSTRAINT FK_Declaratieverwerkingen_ZorgverzekeraarMedewerker FOREIGN KEY (`ZorgverzekeraarMedewerkerID`) REFERENCES Gebruikers(`GebruikerID`);

-- === STAP 3: INDEXES AANMAKEN VOOR PERFORMANCE === --
CREATE INDEX IX_Gebruikers_OrganisatieID ON Gebruikers (`OrganisatieID`);
CREATE INDEX IX_Patienten_HuisartsID ON Patienten (`HuisartsID`);
CREATE INDEX IX_PatientRevalidatiearts_PatientID ON PatientRevalidatiearts (`PatientID`);
CREATE INDEX IX_PatientRevalidatiearts_RevalidatieartsID ON PatientRevalidatiearts (`RevalidatieartsID`);
CREATE INDEX IX_Accessoires_PatientID ON Accessoires (`PatientID`);
CREATE INDEX IX_Activiteiten_logboek_PatientID ON Activiteiten_logboek (`PatientID`);
CREATE INDEX IX_Afspraken_PatientID ON Afspraken (`PatientID`);
CREATE INDEX IX_Afspraken_RevalidatieartsID ON Afspraken (`RevalidatieartsID`);
CREATE INDEX IX_Declaraties_PatientID ON Declaraties (`PatientID`);
CREATE INDEX IX_Declaraties_GedeclareerdDoorGebruikerID ON Declaraties (`GedeclareerdDoorGebruikerID`);
CREATE INDEX IX_Declaratieverwerkingen_DeclaratieID ON Declaratieverwerkingen (`DeclaratieID`);
CREATE INDEX IX_Declaratieverwerkingen_ZorgverzekeraarMedewerkerID ON Declaratieverwerkingen (`ZorgverzekeraarMedewerkerID`);
CREATE INDEX IX_Intakegesprekken_PatientID ON Intakegesprekken (`PatientID`);
CREATE INDEX IX_Medicatie_PatientID ON Medicatie (`PatientID`);
CREATE INDEX IX_Notities_PatientID ON Notities (`PatientID`);
CREATE INDEX IX_Notities_AuteurGebruikerID ON Notities (`AuteurGebruikerID`);
CREATE INDEX IX_Oefenplannen_PatientID ON Oefenplannen (`PatientID`);
CREATE INDEX IX_Oefenplannen_OefeningID ON Oefenplannen (`OefeningID`);
CREATE INDEX IX_Pijnindicaties_PatientID ON Pijnindicaties (`PatientID`);
CREATE INDEX IX_Uitgevoerde_oefeningen_PatientOefenplanID ON Uitgevoerde_oefeningen (`PatientOefenplanID`);
CREATE INDEX IX_Patienten_Naam ON Patienten (`Achternaam`, `Voornaam`);
CREATE INDEX IX_Gebruikers_Naam ON Gebruikers (`Achternaam`, `Voornaam`);
CREATE INDEX IX_Gebruikers_Rol ON Gebruikers (`Rol`);
CREATE INDEX IX_Afspraken_DatumTijd ON Afspraken (`DatumTijdAfspraak`);
CREATE INDEX IX_Pijnindicaties_DatumTijd ON Pijnindicaties (`DatumTijdRegistratie`);

-- === STAP 4: AUDIT TRAIL OPZETTEN === --

DROP TABLE IF EXISTS `AuditTrail`;
CREATE TABLE `AuditTrail` (
    `AuditID` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `TableName` VARCHAR(128) NOT NULL,
    `RecordID` VARCHAR(100) NOT NULL,
    `ActionType` VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    `OldData` JSON NULL, -- Gebruik JSON datatype in MySQL
    `NewData` JSON NULL,
    `ChangedBy` VARCHAR(128) NOT NULL,
    `ChangedAt` DATETIME NOT NULL DEFAULT NOW()
);

-- JSON_OBJECT functie om de data vast te leggen
-- We hebben 3 aparte triggers nodig: INSERT, UPDATE, DELETE

DELIMITER //

DROP TRIGGER IF EXISTS `TR_Patienten_Audit_Insert`//
CREATE TRIGGER `TR_Patienten_Audit_Insert`
AFTER INSERT ON `Patienten`
FOR EACH ROW
BEGIN
    INSERT INTO `AuditTrail` (TableName, RecordID, ActionType, NewData, ChangedBy)
    VALUES (
        'Patienten',
        NEW.PatientID,
        'INSERT',
        JSON_OBJECT(
            'PatientID', NEW.PatientID, 
            'Voornaam', NEW.Voornaam, 
            'Achternaam', NEW.Achternaam, 
            'Geboortedatum', NEW.Geboortedatum, 
            'Adres', NEW.Adres, 
            'Telefoonnummer', NEW.Telefoonnummer, 
            'Email', NEW.Email, 
            'HuisartsID', NEW.HuisartsID
        ),
        USER()
    );
END//

DROP TRIGGER IF EXISTS `TR_Patienten_Audit_Update`//
CREATE TRIGGER `TR_Patienten_Audit_Update`
AFTER UPDATE ON `Patienten`
FOR EACH ROW
BEGIN
    INSERT INTO `AuditTrail` (TableName, RecordID, ActionType, OldData, NewData, ChangedBy)
    VALUES (
        'Patienten',
        NEW.PatientID, -- Of OLD.PatientID, is hetzelfde
        'UPDATE',
        JSON_OBJECT(
            'PatientID', OLD.PatientID, 
            'Voornaam', OLD.Voornaam, 
            'Achternaam', OLD.Achternaam, 
            'Geboortedatum', OLD.Geboortedatum, 
            'Adres', OLD.Adres, 
            'Telefoonnummer', OLD.Telefoonnummer, 
            'Email', OLD.Email, 
            'HuisartsID', OLD.HuisartsID
        ),
        JSON_OBJECT(
            'PatientID', NEW.PatientID, 
            'Voornaam', NEW.Voornaam, 
            'Achternaam', NEW.Achternaam, 
            'Geboortedatum', NEW.Geboortedatum, 
            'Adres', NEW.Adres, 
            'Telefoonnummer', NEW.Telefoonnummer, 
            'Email', NEW.Email, 
            'HuisartsID', NEW.HuisartsID
        ),
        USER()
    );
END//

DROP TRIGGER IF EXISTS `TR_Patienten_Audit_Delete`//
CREATE TRIGGER `TR_Patienten_Audit_Delete`
AFTER DELETE ON `Patienten`
FOR EACH ROW
BEGIN
    INSERT INTO `AuditTrail` (TableName, RecordID, ActionType, OldData, ChangedBy)
    VALUES (
        'Patienten',
        OLD.PatientID,
        'DELETE',
        JSON_OBJECT(
            'PatientID', OLD.PatientID, 
            'Voornaam', OLD.Voornaam, 
            'Achternaam', OLD.Achternaam, 
            'Geboortedatum', OLD.Geboortedatum, 
            'Adres', OLD.Adres, 
            'Telefoonnummer', OLD.Telefoonnummer, 
            'Email', OLD.Email, 
            'HuisartsID', OLD.HuisartsID
        ),
        USER()
    );
END//

DELIMITER ;