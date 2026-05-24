Feature: App Loading

  Scenario: App shows login page when unauthenticated
    Given I navigate to the app
    Then I should see the authentication form
