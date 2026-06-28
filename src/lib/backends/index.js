import { createDemoBackend } from "./demoBackend";
import { createFirebaseBackend, isFirebaseConfigured } from "./firebaseBackend";

export function createBackend() {
  if (isFirebaseConfigured()) {
    return createFirebaseBackend();
  }

  return createDemoBackend();
}
