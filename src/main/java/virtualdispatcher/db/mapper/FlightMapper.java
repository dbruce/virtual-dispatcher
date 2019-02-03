package virtualdispatcher.db.mapper;

import org.springframework.jdbc.core.RowMapper;
import virtualdispatcher.api.Flight;
import virtualdispatcher.api.FlightFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * {@link Flight} mapper.
 *
 * @author Grayson Kuhns
 */
@Singleton
public class FlightMapper implements RowMapper<Flight> {

  // Constants
  private static final String KEY_ID = "id";
  private static final String KEY_COMPLETED = "completed";
  private static final String KEY_STARTED = "started";
  private static final String KEY_PILOT_ID = "pilot_id";
  private static final String KEY_AIRCRAFT_ID = "aircraft_id";
  private static final String KEY_ZONE_ID = "zone_id";

  // Dependencies
  private final FlightFactory flightFactory;

  /**
   * Constructor.
   *
   * @param flightFactory The {@link FlightFactory}.
   */
  @Inject
  FlightMapper(final FlightFactory flightFactory) {
    this.flightFactory = flightFactory;
  }

  @Override
  public Flight mapRow(ResultSet rs, int rowNum) throws SQLException {
    return flightFactory.create(
            rs.getInt(KEY_ID),
            rs.getBoolean(KEY_COMPLETED),
            rs.getBoolean(KEY_STARTED),
            rs.getInt(KEY_PILOT_ID),
            rs.getInt(KEY_AIRCRAFT_ID),
            rs.getInt(KEY_ZONE_ID));
  }
}
