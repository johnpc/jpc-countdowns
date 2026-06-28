Feature: Settings

  A logged-in user can open settings to manage the Home Screen widget and their
  account, then return to the countdowns list.

  Background:
    Given I am logged in

  Scenario: View settings and return
    When I open settings
    Then I should see the widget settings
    And I should see account management options
    When I return from settings
    Then I should see the countdowns list
