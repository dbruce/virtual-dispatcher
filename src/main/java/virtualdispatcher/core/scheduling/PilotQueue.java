package virtualdispatcher.core.scheduling;

import com.google.inject.Inject;
import java.util.List;
import java.util.Optional;
import virtualdispatcher.api.Pilot;
import virtualdispatcher.db.dao.AvailabilityDAO;
import virtualdispatcher.db.dao.PilotDAO;

public class PilotQueue {

  // Dependencies
  private final PilotDAO pilotDAO;
  private final AvailabilityDAO availabilityDAO;

  @Inject
  PilotQueue(
      final PilotDAO pilotDAO,
      final AvailabilityDAO availabilityDAO) {

    this.pilotDAO = pilotDAO;
    this.availabilityDAO = availabilityDAO;
  }

  public Optional<Pilot> getNextPilot() {
    List<Pilot> pilots = pilotDAO.list();

    return availabilityDAO
        .list()
        .stream()
        .sorted()
        .map(avail -> pilots
              .stream()
              .filter(pilot -> pilot.getId() == avail.getPilotId())
              .findFirst()
              .orElseThrow(() -> new RuntimeException("Pilot not found matching availability record")))
        .findFirst();
  }
}
