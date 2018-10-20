# Virtual Dispacher Database Datafill
# Last Edit: 10/19/2018 7:54 PM

INSERT INTO pilot (f_name, l_name)
	VALUES
		("Denise", "Bruce"),
		("Mitchell", "Jurich"),
		("Jerome", "Tujague"),
		("Grayson", "Kuhns"),
		("Jon", "Brockhorst");
		
INSERT INTO aircraft (operational)
	VALUES
		(true),
		(true),
		(true),
		(false),
		(true),
		(false),
		(true),
		(true),
		(true);
	
INSERT INTO zones
	VALUES
		(),
		(),
		(),
		(),
		(),
		();
	
INSERT INTO avaliability
	VALUES
		(2, TIME_FORMAT("11:02:12", "%T")),
		(1, TIME_FORMAT("10:33:00", "%T")),
		(5, TIME_FORMAT("13:14:47", "%T"));
	
INSERT INTO flights (completed, pilot_id, aircraft_id, zone_id)
	VALUES
		(true, 2, 4, 2),
		(true, 1, 6, 3),
		(true, 3, 2, 1),
		(false, 3, 1, 1),
		(false, 4, 2, 1);