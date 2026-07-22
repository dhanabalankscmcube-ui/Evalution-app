import { Injectable, signal, effect } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ThemeService {
  darkMode = signal(false);

  constructor() {
    effect(() => {
      const doc = document.documentElement;
      if (this.darkMode()) {
        doc.classList.add("dark");
      } else {
        doc.classList.remove("dark");
      }
    });
  }

  toggle(): void {
    this.darkMode.update((v) => !v);
  }
}
