package virtualdispatcher.core.scheduling;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import virtualdispatcher.api.Aircraft;
import virtualdispatcher.api.Flight;
import virtualdispatcher.db.dao.AircraftDAO;
import virtualdispatcher.db.dao.FlightDAO;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Singleton
public class AircraftLocator {

  // Dependencies
  private final FlightDAO flightDAO;
  private final AircraftDAO aircraftDAO;

  @Inject
  public AircraftLocator(
      final FlightDAO flightDAO,
      final AircraftDAO aircraftDAO) {

    this.flightDAO = flightDAO;
    this.aircraftDAO = aircraftDAO;
  }

  public List<Aircraft> getAvailableAircraft() {
    List<Integer> activeFlights = flightDAO
        .list(false, null)
        .stream()
        .map(Flight::getAircraftId)
        .collect(Collectors.toList());

    return aircraftDAO
        .list(true)
        .stream()
        .filter(plane -> !activeFlights.contains(plane.getId()))
        .collect(Collectors.toList());
  }

  public Optional<Aircraft> getNextAvailableAircraft() {
    return getAvailableAircraft()
        .stream()
        .findFirst();
  }
}
