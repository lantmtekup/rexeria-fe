/**
 * Side-effect barrel: importing this module registers every preset with
 * the singleton `motionRegistry`. The registry is then queried from
 * runtime + UI without needing to know which preset files exist.
 */
import './hero';
import './feature';
import './gallery';
import './form';
import './cta';
