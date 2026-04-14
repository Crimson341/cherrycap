"use client";

import { useTheme } from "@/components/ThemeProvider";
import React from "react";
import { Button } from "./ui/button";
import { MoonAltToSunnyOutlineLoopTransitionIcon } from "./Icons";
import { MoonIcon } from "lucide-react";

function ToggleThemeBtn() {
  const { setTheme, theme, systemTheme } = useTheme();
  const theTheme =
    theme === "system"
      ? systemTheme === "dark"
        ? "sun"
        : "moon"
      : theme === "dark"
      ? "sun"
      : "moon";
  function changeTheme() {
    return theTheme === "moon" ? setTheme("dark") : setTheme("light");
  }
  return (
    <Button
      variant={"outline"}
      size={"icon"}
      className="rounded-full cursor-pointer"
      aria-label={theTheme === "sun" ? "Switch to dark mode" : "Switch to light mode"}
      onClick={changeTheme}
    >
      {theTheme === "sun" ? (
        <MoonAltToSunnyOutlineLoopTransitionIcon />
      ) : (
        <MoonIcon />
      )}
    </Button>
  );
}

export default ToggleThemeBtn;
