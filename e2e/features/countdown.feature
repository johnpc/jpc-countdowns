Feature: Managing countdowns

  A logged-in user can create, edit, and delete a countdown. Each scenario
  operates on its own uniquely-named countdown and deletes it, so the suite is
  safe and re-runnable against the shared backend.

  Background:
    Given I am logged in

  Scenario: Create, edit, and delete a countdown
    When I create a countdown with a unique title
    Then I should see my new countdown in the list
    When I open my countdown for editing
    And I change its title
    Then I should see my new countdown in the list
    When I delete my countdown
    Then I should not see my countdown in the list
