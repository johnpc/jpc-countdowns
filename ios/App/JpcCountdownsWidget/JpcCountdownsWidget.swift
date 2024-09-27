//
//  JpcCountdownsWidget.swift
//  JpcCountdownsWidget
//
//  Created by Corser, John on 9/16/24.
//

import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), emoji: "😀", title: "Demo", hexColor: "#ffffff", countdownDate: .now)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), emoji: "😀", title: "Demo", hexColor: "#ffffff", countdownDate: .now)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        
        if let userDefaults = UserDefaults(suiteName: "group.com.johncorser.countdowns.prefs") {
            let countdownEntitiesJsonString = userDefaults.string(forKey: "countdownEntities") ?? "[]"

            let data = countdownEntitiesJsonString.data(using: .utf8)!
            do {
                if let jsonArray = try JSONSerialization.jsonObject(with: data, options : .allowFragments) as? [Dictionary<String,Any>]
                {
                    var entries: [SimpleEntry] = []
                    for countdownEntity in jsonArray {
                        let emoji = countdownEntity["emoji"] as! String
                        let title = countdownEntity["title"] as! String
                        let color = countdownEntity["hexColor"] as! String
                        let dateString = countdownEntity["date"] as! String
                        let dateFormatter = DateFormatter()
                        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // set locale to reliable US_POSIX
                        
                        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
                        print(dateString)
                        let date = dateFormatter.date(from:dateString)!
                        
                        let calendar = Calendar.current
                        let components = calendar.dateComponents([.year, .month, .day, .hour], from: date)
                        let entryDate = calendar.date(from:components)!
                        
                        let entry = SimpleEntry(date: .now, emoji: emoji, title: title, hexColor: color, countdownDate: entryDate)
                        
                        let currentDate = Date()
                        if (currentDate < entryDate) {
                            entries.append(entry)
                            break;
                        }
                    }

                    let timeline = Timeline(entries: entries, policy: .atEnd)
                    completion(timeline)
                    print("Done")
                } else {
                    print("bad json")
                }
            } catch let error as NSError {
                print(error)
            }
        } else {
            var entries: [SimpleEntry] = []

            // Generate a timeline consisting of five entries an hour apart, starting from the current date.
            let currentDate = Date()
            for hourOffset in 0 ..< 5 {
                let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
                
                
                let entry = SimpleEntry(date: .now, emoji: "😀", title: "No Countdowns Yet", hexColor: "#ffffff", countdownDate: entryDate)
                entries.append(entry)
            }

            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
        }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let emoji: String
    let title: String
    let hexColor: String
    let countdownDate: Date
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

func stringFromTimeInterval (timeInterval: TimeInterval) -> String {
        let endingDate = Date()
        let startingDate = endingDate.addingTimeInterval(-timeInterval)
        let calendar = Calendar.current

        let componentsNow = calendar.dateComponents([.month, .day], from: startingDate, to: endingDate)
    
        var string = ""
        
        if componentsNow.month ?? 0 > 0 {
            string.append("\(String(describing: componentsNow.month!)) months ")
        }
        if componentsNow.day ?? 0 > 0 {
            string.append("\(String(describing: componentsNow.day!)) days")
        }
    
        if string.isEmpty {
            return "Today"
        }
    
        print(string)
        return string

    }

struct JpcCountdownsWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        ZStack {
            ContainerRelativeShape().fill(Color.init(hex: entry.hexColor).gradient)
            VStack {
                Spacer()
                HStack() {
                    Text(entry.emoji).font(.title)
                    Text(entry.title).font(.system(size:12)).fontWeight(.bold).minimumScaleFactor(0.6).foregroundColor(.black.opacity(0.6))
                    
                }
                Spacer()
                Text(stringFromTimeInterval(timeInterval: Date().distance(to: entry.countdownDate)))
                    .font(.system(size: 20, weight: .heavy))
                    .foregroundColor(.white.opacity(0.8))
                Spacer()
            }
        }
    }
}

struct JpcCountdownsWidget: Widget {
    let kind: String = "JpcCountdownsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                JpcCountdownsWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            }
            else {
                JpcCountdownsWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("jpc.countdowns")
        .description("See your upcoming countdown.")
        .supportedFamilies([.systemSmall])
    }
}

#Preview(as: .systemSmall) {
    JpcCountdownsWidget()
} timeline: {
    SimpleEntry(date: .now, emoji: "😀", title: "Demo #1", hexColor: "#ffffff", countdownDate: .now)
    SimpleEntry(date: .now, emoji: "🤩", title: "Demo #2", hexColor: "#e2e2e2", countdownDate: .now)
}
