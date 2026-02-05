import { render, screen } from "@testing-library/react"
import Home from "../app/page"

describe("Home page", () => {
  it("renders the TradeMatch API message", () => {
    render(<Home />)
    expect(screen.getByText(/TradeMatch API — mobile backend only\./i)).toBeInTheDocument()
  })
})
