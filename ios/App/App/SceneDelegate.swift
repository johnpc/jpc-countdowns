import UIKit
import Capacitor

// Scene-based lifecycle. The iOS 27 SDK (Xcode 27) requires UIScene adoption:
// apps linked against it that still rely on the AppDelegate-only lifecycle are
// killed at launch by UIKit (EXC_BREAKPOINT in
// __UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption).
//
// Info.plist's UIApplicationSceneManifest points at this class and at
// Main.storyboard, which instantiates Capacitor's CAPBridgeViewController, so
// no manual window setup is needed here. Deep links and Universal Links now
// arrive via the scene callbacks below instead of the AppDelegate ones, and are
// forwarded to Capacitor so the @capacitor/app `appUrlOpen` event still fires.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // The bridge view controller registers its URL observers in viewDidLoad,
        // which hasn't happened yet while the scene is connecting; defer until
        // the storyboard's view hierarchy is on screen.
        let urlContexts = connectionOptions.urlContexts
        let userActivities = connectionOptions.userActivities
        DispatchQueue.main.async { [weak self] in
            self?.forward(urlContexts: urlContexts)
            userActivities.forEach { self?.forward(userActivity: $0) }
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        forward(urlContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        forward(userActivity: userActivity)
    }

    private func forward(urlContexts: Set<UIOpenURLContext>) {
        for context in urlContexts {
            var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
            if let source = context.options.sourceApplication {
                options[.sourceApplication] = source
            }
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url, options: options)
        }
    }

    private func forward(userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
}
