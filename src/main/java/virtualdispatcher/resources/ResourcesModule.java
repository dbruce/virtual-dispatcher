package virtualdispatcher.resources;

import com.google.inject.AbstractModule;
import com.google.inject.multibindings.Multibinder;
import virtualdispatcher.api.Availability;

public class ResourcesModule extends AbstractModule {

  @Override
  protected void configure() {
    Multibinder<Resource> resourceMultibinder =
        Multibinder.newSetBinder(binder(), Resource.class);

    resourceMultibinder.addBinding().to(FlightsResource.class);
    resourceMultibinder.addBinding().to(AvailabilityResource.class);
  }
}
