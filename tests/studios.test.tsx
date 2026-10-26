import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WeddingStudio } from "../src/components/WeddingStudio";
import { BirthdayStudio } from "../src/components/BirthdayStudio";
import { CommunityStudio } from "../src/components/CommunityStudio";
import { SAMPLES } from "../src/data/samples";

const commonProps = {
  isSample: false,
  phase: "intake" as const,
  source: null,
  messages: [],
  busy: false,
  onSend: vi.fn(),
  onReset: vi.fn(),
  onSpent: vi.fn(),
  onToggleTimeline: vi.fn(),
  onVendor: vi.fn(),
  onIdea: vi.fn(),
  onTask: vi.fn(),
  onCopy: vi.fn(),
  onBackToHome: vi.fn(),
};

describe("Dedicated Studio components", () => {
  describe("WeddingStudio", () => {
    it("renders intake form and triggers generate with custom wedding details", async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      const onLoadSample = vi.fn();

      render(
        <WeddingStudio
          {...commonProps}
          plan={SAMPLES.wedding}
          hasPlan={false}
          onGenerateWithDetails={onGenerate}
          onLoadSample={onLoadSample}
        />
      );

      expect(screen.getByRole("heading", { name: /wedding studio/i })).toBeInTheDocument();

      // Test input changes
      const namesInput = screen.getByLabelText(/couple \/ wedding name/i);
      await user.clear(namesInput);
      await user.type(namesInput, "Emma & Noah");

      const dateInput = screen.getByLabelText(/target wedding date/i);
      await user.clear(dateInput);
      await user.type(dateInput, "2027-06-20");

      const guestSlider = screen.getByLabelText(/estimated guest count/i);
      await user.type(guestSlider, "{arrowright}");

      const budgetInput = screen.getByLabelText(/total wedding budget/i);
      await user.clear(budgetInput);
      await user.type(budgetInput, "45000");

      const styleSelect = screen.getByLabelText(/aesthetic style/i);
      await user.selectOptions(styleSelect, "elegant");

      const locInput = screen.getByPlaceholderText(/e\.g\. napa valley/i);
      await user.clear(locInput);
      await user.type(locInput, "Carmel-by-the-Sea");

      const notesInput = screen.getByPlaceholderText(/sangeet celebration/i);
      await user.clear(notesInput);
      await user.type(notesInput, "Beachside ceremony");

      // Toggle must have pill
      const fairyLights = screen.getByRole("button", { name: /fairy lights arch/i });
      await user.click(fairyLights); // uncheck
      await user.click(fairyLights); // recheck

      // Load sample button
      const loadSampleBtn = screen.getByRole("button", { name: /explore sample wedding/i });
      await user.click(loadSampleBtn);
      expect(onLoadSample).toHaveBeenCalledTimes(1);

      // Back to home button
      await user.click(screen.getByRole("button", { name: /back to home/i }));
      expect(commonProps.onBackToHome).toHaveBeenCalled();

      // Generate button
      const generateBtn = screen.getByRole("button", { name: /generate wedding blueprint/i });
      await user.click(generateBtn);
      expect(onGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "wedding",
          name: "Emma & Noah's Wedding",
          totalBudget: 45000,
        })
      );
    });

    it("renders active plan and dashboard when hasPlan is true", async () => {
      render(
        <WeddingStudio
          {...commonProps}
          plan={SAMPLES.wedding}
          hasPlan={true}
          phase="refining"
          onGenerateWithDetails={vi.fn()}
          onLoadSample={vi.fn()}
        />
      );

      expect(screen.getByRole("heading", { name: /wedding studio/i })).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByRole("tablist", { name: /plan sections/i })).toBeInTheDocument();
      });
    });
  });

  describe("BirthdayStudio", () => {
    it("renders birthday intake form and handles interactions", async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      const onLoadSample = vi.fn();

      render(
        <BirthdayStudio
          {...commonProps}
          plan={SAMPLES.birthday}
          hasPlan={false}
          onGenerateWithDetails={onGenerate}
          onLoadSample={onLoadSample}
        />
      );

      expect(screen.getByRole("heading", { name: /birthday studio/i })).toBeInTheDocument();

      const honoreeInput = screen.getByLabelText(/guest of honor/i);
      await user.clear(honoreeInput);
      await user.type(honoreeInput, "Alex");

      const milestoneSelect = screen.getByLabelText(/milestone occasion/i);
      await user.selectOptions(milestoneSelect, "Sweet 16 Dance Party");

      const dateInput = screen.getByLabelText(/party date/i);
      await user.clear(dateInput);
      await user.type(dateInput, "2026-12-05");

      const budgetInput = screen.getByLabelText(/total birthday budget/i);
      await user.clear(budgetInput);
      await user.type(budgetInput, "7500");

      const guestSlider = screen.getByLabelText(/guest count/i);
      await user.type(guestSlider, "{arrowright}");

      const styleSelect = screen.getByLabelText(/party vibe/i);
      await user.selectOptions(styleSelect, "casual");

      const locInput = screen.getByLabelText(/party venue \/ location/i);
      await user.clear(locInput);
      await user.type(locInput, "Rooftop Lounge");

      const cakeInput = screen.getByLabelText(/custom cake & dessert theme/i);
      await user.clear(cakeInput);
      await user.type(cakeInput, "Red Velvet");

      // Toggle fun activities pill
      const photoBooth = screen.getByRole("button", { name: /neon photo backdrop/i });
      await user.click(photoBooth);
      await user.click(photoBooth);

      // Load sample
      await user.click(screen.getByRole("button", { name: /explore sample birthday/i }));
      expect(onLoadSample).toHaveBeenCalledTimes(1);

      // Generate
      await user.click(screen.getByRole("button", { name: /generate birthday blueprint/i }));
      expect(onGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "birthday",
          name: expect.stringContaining("Alex"),
          totalBudget: 7500,
        })
      );
    });

    it("renders birthday plan dashboard when hasPlan is true", async () => {
      render(
        <BirthdayStudio
          {...commonProps}
          plan={SAMPLES.birthday}
          hasPlan={true}
          phase="refining"
          onGenerateWithDetails={vi.fn()}
          onLoadSample={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("tablist", { name: /plan sections/i })).toBeInTheDocument();
      });
    });
  });

  describe("CommunityStudio", () => {
    it("renders community festival form and handles interactions", async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      const onLoadSample = vi.fn();

      render(
        <CommunityStudio
          {...commonProps}
          plan={SAMPLES.community}
          hasPlan={false}
          onGenerateWithDetails={onGenerate}
          onLoadSample={onLoadSample}
        />
      );

      expect(screen.getByRole("heading", { name: /community & festival studio/i })).toBeInTheDocument();

      const eventInput = screen.getByLabelText(/festival \/ event name/i);
      await user.clear(eventInput);
      await user.type(eventInput, "Highland Park Summerfest");

      const catSelect = screen.getByLabelText(/event category/i);
      await user.selectOptions(catSelect, "Neighborhood Block Party");

      const dateInput = screen.getByLabelText(/festival date/i);
      await user.clear(dateInput);
      await user.type(dateInput, "2026-10-31");

      const budgetInput = screen.getByLabelText(/total budget/i);
      await user.clear(budgetInput);
      await user.type(budgetInput, "18000");

      const guestSlider = screen.getByLabelText(/expected attendees/i);
      await user.type(guestSlider, "{arrowright}");

      const styleSelect = screen.getByLabelText(/venue & style/i);
      await user.selectOptions(styleSelect, "casual");

      const locInput = screen.getByLabelText(/park location \/ address/i);
      await user.clear(locInput);
      await user.type(locInput, "Westside Plaza");

      const permitInput = screen.getByLabelText(/city permits & municipal requirements/i);
      await user.clear(permitInput);
      await user.type(permitInput, "Sound permit approved");

      // Toggle logistics pill
      const stageToggle = screen.getByRole("button", { name: /covered stage & pa sound/i });
      await user.click(stageToggle);
      await user.click(stageToggle);

      // Load sample
      await user.click(screen.getByRole("button", { name: /explore sample festival/i }));
      expect(onLoadSample).toHaveBeenCalledTimes(1);

      // Generate
      await user.click(screen.getByRole("button", { name: /generate festival blueprint/i }));
      expect(onGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "community",
          name: "Highland Park Summerfest",
          totalBudget: 18000,
        })
      );
    });

    it("renders community plan dashboard when hasPlan is true", async () => {
      render(
        <CommunityStudio
          {...commonProps}
          plan={SAMPLES.community}
          hasPlan={true}
          phase="refining"
          onGenerateWithDetails={vi.fn()}
          onLoadSample={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("tablist", { name: /plan sections/i })).toBeInTheDocument();
      });
    });
  });
});
