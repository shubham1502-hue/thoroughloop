"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, STORAGE_KEYS, readJson, type Settings, writeJson } from "@thoroughloop/core";
import { webLocalStorageAdapter } from "@/storage/webLocalStorageAdapter";

const fields: Array<{ key: keyof Settings; label: string }> = [
  { key: "founderName", label: "Founder name" },
  { key: "companyName", label: "Company name" },
  { key: "companyStage", label: "Company stage" },
  { key: "industry", label: "Industry" },
  { key: "icp", label: "ICP" },
  { key: "gtmMotion", label: "GTM motion" },
  { key: "defaultWeeklyReviewDay", label: "Default weekly review day" }
];

const inputClass =
  "control-light rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/15";

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    void readJson<Settings>(webLocalStorageAdapter, STORAGE_KEYS.settings, DEFAULT_SETTINGS).then(setSettings);
  }, []);

  function updateSetting(key: keyof Settings, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings() {
    await writeJson(webLocalStorageAdapter, STORAGE_KEYS.settings, settings);
    setConfirmation("Settings saved");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-5 px-4 py-8 sm:px-5 md:gap-6 md:px-8 md:py-10">
      <div className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Settings</p>
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">Founder context defaults</h1>
        <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
          These settings help memo generation choose the owner and company context without adding setup burden.
        </p>
      </div>

      <section data-ui-surface="light" className="surface-light rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className="grid gap-2">
              <span className="text-sm font-semibold">{field.label}</span>
              <input
                className={inputClass}
                value={settings[field.key]}
                onChange={(event) => updateSetting(field.key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="mt-5">
          <button type="button" onClick={saveSettings} className="w-full rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-white sm:w-auto sm:py-2">
            Save settings
          </button>
          {confirmation ? <p className="mt-3 text-sm font-semibold text-forest">{confirmation}</p> : null}
        </div>
      </section>
    </div>
  );
}
