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

  Scenario: Actions apply instantly and deletes can be undone
    When I create a countdown with a unique title
    Then I should see my new countdown in the list immediately
    When I delete my countdown
    Then I should not see my countdown in the list immediately
    And I should see a delete toast with an Undo button
    When I undo the delete
    Then I should see my new countdown in the list
    When I delete my countdown
    Then I should not see my countdown in the list

  Scenario: Submitting an incomplete countdown shows which fields are missing
    When I try to create a countdown with only a title
    Then I should see an inline validation message naming the missing fields
