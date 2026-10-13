import { test, expect, type Page, type Locator } from "@playwright/test";

async function waitSettled(page: Page) {
  await expect(page.getByTestId("scoreboard")).toHaveAttribute("data-pending", "false", {
    timeout: 20_000,
  });
}

async function clickPoints(page: Page, pad: Locator, times: number) {
  for (let i = 0; i < times; i++) {
    await waitSettled(page);
    await expect(pad).toBeEnabled();
    await pad.click();
    await waitSettled(page);
  }
}

async function openMobileNavIfNeeded(page: Page) {
  const toggle = page.getByRole("button", { name: /open menu/i });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  }
}

async function openMatch(page: Page, matchNumber: number) {
  await page.goto("/matches");
  await page.getByTestId(`match-card-${matchNumber}`).click();
  await expect(page.getByTestId("scoreboard")).toBeVisible();
}

async function resetMatch(page: Page) {
  page.once("dialog", (d) => d.accept());
  await page.getByTestId("reset-match").click();
  await waitSettled(page);
  await expect(page.getByTestId("score-home")).toContainText("0");
  await expect(page.getByTestId("score-away")).toContainText("0");
  await expect(page.getByTestId("games-home")).toContainText("0");
  await expect(page.getByTestId("games-away")).toContainText("0");
}

test.describe("Smash League", () => {
  test("home, nav, matches, standings, teams load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Smash/i);
    await expect(page.getByLabel("League snapshot")).toBeVisible();

    await openMobileNavIfNeeded(page);
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Matches" }).click();
    await expect(page).toHaveURL(/\/matches$/);
    await expect(page.getByRole("heading", { name: /Match pool/i })).toBeVisible();

    await openMobileNavIfNeeded(page);
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Standings" }).click();
    await expect(page).toHaveURL(/\/leaderboard/);
    await expect(page.getByTestId("standings-table")).toBeVisible();

    await openMobileNavIfNeeded(page);
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Teams" }).click();
    await expect(page).toHaveURL(/\/teams/);
    await expect(page.getByText("Sherry & Ahsan")).toBeVisible();
  });

  test("click scoreboard has no number inputs and scores a game", async ({ page }) => {
    await openMatch(page, 1);
    await expect(page.locator('input[type="number"]')).toHaveCount(0);

    const start = page.getByTestId("start-match");
    if (await start.isVisible()) {
      await start.click();
      await waitSettled(page);
    }

    await resetMatch(page);

    const homePad = page.getByTestId("score-home");
    await clickPoints(page, homePad, 11);

    await expect(page.getByTestId("games-home")).toContainText("1", { timeout: 15_000 });
    await expect(page.getByTestId("game-chip-1")).toContainText("11–0");
    await expect(homePad).toContainText("0");

    await clickPoints(page, page.getByTestId("score-away"), 1);
    await expect(page.getByTestId("score-away")).toContainText("1");
    await page.getByTestId("undo-away").click();
    await waitSettled(page);
    await expect(page.getByTestId("score-away")).toContainText("0");
  });

  test("match completes at 3-0 via click scoring", async ({ page }) => {
    await openMatch(page, 2);
    await resetMatch(page);

    const homePad = page.getByTestId("score-home");
    for (let game = 0; game < 3; game++) {
      for (let p = 0; p < 11; p++) {
        const lastPoint = game === 2 && p === 10;
        await waitSettled(page);
        if (!lastPoint) {
          await expect(homePad).toBeEnabled();
        } else if (await homePad.isDisabled()) {
          break;
        }
        await homePad.click();
        await waitSettled(page);
      }
      await expect(page.getByTestId("games-home")).toContainText(String(game + 1), {
        timeout: 15_000,
      });
    }

    await expect(page.getByTestId("match-winner")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("games-home")).toContainText("3");
    await expect(page.getByTestId("scoreboard")).toHaveAttribute("data-status", "COMPLETED");
    await expect(page.getByTestId("score-home")).toBeDisabled();
  });

  test("no horizontal overflow on mobile home", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("mobile"), "mobile project only");
    await page.goto("/");
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
