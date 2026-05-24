Feature: App Loading

  Scenario: User can log in and see countdowns
    Given I navigate to the app
    When I log in with valid credentials
    Then I should see the countdowns list
