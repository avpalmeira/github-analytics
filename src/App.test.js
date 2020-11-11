import React from "react";
import { render, screen } from "@testing-library/react";

import App from "./App";

test("renders all required cards", () => {
  render(<App />);
  const avgPRBySizeCard = screen.getByText(/Time by Pull Request Size/i);
  const avgPRMergeTimeCard = screen.getByText(/Pull Request Merge Time/i);
  const avgIssueCloseTimeCard = screen.getByText(/Issue Close Time/i);
  const monthSummaryCard = screen.getByText(/Month Summary/i);

  expect(avgPRBySizeCard).toBeInTheDocument();
  expect(avgPRMergeTimeCard).toBeInTheDocument();
  expect(avgIssueCloseTimeCard).toBeInTheDocument();
  expect(monthSummaryCard).toBeInTheDocument();
});

test("renders inputs to repository path", () => {
  render(<App />);

  const ownerInput = screen.getByPlaceholderText(/Owner/i);
  const repositoryInput = screen.getByPlaceholderText(/Repository Name/i);
  const formButton = screen.getByRole('button');

  expect(ownerInput).toBeInTheDocument();
  expect(repositoryInput).toBeInTheDocument();
  expect(formButton).toBeInTheDocument();
});

