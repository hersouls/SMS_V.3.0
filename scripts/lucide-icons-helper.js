#!/usr/bin/env node

// Lucide Icons Helper Script
// 사용법: node scripts/lucide-icons-helper.js [명령] [인수]

const lucideIcons = {
  "activity": "Activity icon",
  "airplay": "Airplay icon", 
  "alert-circle": "Alert circle icon",
  "alert-octagon": "Alert octagon icon",
  "alert-triangle": "Alert triangle icon",
  "align-center": "Align center icon",
  "align-justify": "Align justify icon",
  "align-left": "Align left icon",
  "align-right": "Align right icon",
  "anchor": "Anchor icon",
  "aperture": "Aperture icon",
  "archive": "Archive icon",
  "arrow-down": "Arrow down icon",
  "arrow-left": "Arrow left icon",
  "arrow-right": "Arrow right icon",
  "arrow-up": "Arrow up icon",
  "at-sign": "At sign icon",
  "award": "Award icon",
  "bar-chart": "Bar chart icon",
  "battery": "Battery icon",
  "bell": "Bell icon",
  "bluetooth": "Bluetooth icon",
  "bold": "Bold icon",
  "book": "Book icon",
  "bookmark": "Bookmark icon",
  "box": "Box icon",
  "briefcase": "Briefcase icon",
  "calendar": "Calendar icon",
  "camera": "Camera icon",
  "cast": "Cast icon",
  "check": "Check icon",
  "check-circle": "Check circle icon",
  "check-square": "Check square icon",
  "chevron-down": "Chevron down icon",
  "chevron-left": "Chevron left icon",
  "chevron-right": "Chevron right icon",
  "chevron-up": "Chevron up icon",
  "chrome": "Chrome icon",
  "circle": "Circle icon",
  "clipboard": "Clipboard icon",
  "clock": "Clock icon",
  "cloud": "Cloud icon",
  "code": "Code icon",
  "codepen": "Codepen icon",
  "codesandbox": "Codesandbox icon",
  "coffee": "Coffee icon",
  "columns": "Columns icon",
  "command": "Command icon",
  "compass": "Compass icon",
  "copy": "Copy icon",
  "corner-down-left": "Corner down left icon",
  "corner-down-right": "Corner down right icon",
  "corner-left-down": "Corner left down icon",
  "corner-left-up": "Corner left up icon",
  "corner-right-down": "Corner right down icon",
  "corner-right-up": "Corner right up icon",
  "corner-up-left": "Corner up left icon",
  "corner-up-right": "Corner up right icon",
  "cpu": "CPU icon",
  "credit-card": "Credit card icon",
  "crop": "Crop icon",
  "crosshair": "Crosshair icon",
  "database": "Database icon",
  "delete": "Delete icon",
  "disc": "Disc icon",
  "dollar-sign": "Dollar sign icon",
  "download": "Download icon",
  "download-cloud": "Download cloud icon",
  "droplet": "Droplet icon",
  "edit": "Edit icon",
  "edit-2": "Edit 2 icon",
  "edit-3": "Edit 3 icon",
  "external-link": "External link icon",
  "eye": "Eye icon",
  "eye-off": "Eye off icon",
  "facebook": "Facebook icon",
  "fast-forward": "Fast forward icon",
  "feather": "Feather icon",
  "figma": "Figma icon",
  "file": "File icon",
  "file-text": "File text icon",
  "film": "Film icon",
  "filter": "Filter icon",
  "flag": "Flag icon",
  "folder": "Folder icon",
  "folder-minus": "Folder minus icon",
  "folder-plus": "Folder plus icon",
  "framer": "Framer icon",
  "frown": "Frown icon",
  "gift": "Gift icon",
  "git-branch": "Git branch icon",
  "git-commit": "Git commit icon",
  "git-merge": "Git merge icon",
  "git-pull-request": "Git pull request icon",
  "github": "GitHub icon",
  "gitlab": "GitLab icon",
  "globe": "Globe icon",
  "grid": "Grid icon",
  "hard-drive": "Hard drive icon",
  "hash": "Hash icon",
  "headphones": "Headphones icon",
  "heart": "Heart icon",
  "help-circle": "Help circle icon",
  "hexagon": "Hexagon icon",
  "home": "Home icon",
  "image": "Image icon",
  "inbox": "Inbox icon",
  "info": "Info icon",
  "instagram": "Instagram icon",
  "italic": "Italic icon",
  "key": "Key icon",
  "layers": "Layers icon",
  "layout": "Layout icon",
  "life-buoy": "Life buoy icon",
  "light-bulb": "Light bulb icon",
  "link": "Link icon",
  "link-2": "Link 2 icon",
  "linkedin": "LinkedIn icon",
  "list": "List icon",
  "loader": "Loader icon",
  "lock": "Lock icon",
  "log-in": "Log in icon",
  "log-out": "Log out icon",
  "mail": "Mail icon",
  "map-pin": "Map pin icon",
  "maximize": "Maximize icon",
  "maximize-2": "Maximize 2 icon",
  "meh": "Meh icon",
  "menu": "Menu icon",
  "message-circle": "Message circle icon",
  "message-square": "Message square icon",
  "mic": "Mic icon",
  "mic-off": "Mic off icon",
  "minimize": "Minimize icon",
  "minimize-2": "Minimize 2 icon",
  "monitor": "Monitor icon",
  "moon": "Moon icon",
  "more-horizontal": "More horizontal icon",
  "more-vertical": "More vertical icon",
  "mouse-pointer": "Mouse pointer icon",
  "move": "Move icon",
  "music": "Music icon",
  "navigation": "Navigation icon",
  "navigation-2": "Navigation 2 icon",
  "octagon": "Octagon icon",
  "package": "Package icon",
  "paperclip": "Paperclip icon",
  "pause": "Pause icon",
  "pause-circle": "Pause circle icon",
  "pen-tool": "Pen tool icon",
  "percent": "Percent icon",
  "phone": "Phone icon",
  "phone-call": "Phone call icon",
  "phone-forwarded": "Phone forwarded icon",
  "phone-incoming": "Phone incoming icon",
  "phone-missed": "Phone missed icon",
  "phone-off": "Phone off icon",
  "phone-outgoing": "Phone outgoing icon",
  "pie-chart": "Pie chart icon",
  "play": "Play icon",
  "play-circle": "Play circle icon",
  "plus": "Plus icon",
  "plus-circle": "Plus circle icon",
  "plus-square": "Plus square icon",
  "pocket": "Pocket icon",
  "power": "Power icon",
  "printer": "Printer icon",
  "radio": "Radio icon",
  "refresh-ccw": "Refresh ccw icon",
  "refresh-cw": "Refresh cw icon",
  "repeat": "Repeat icon",
  "rewind": "Rewind icon",
  "rotate-ccw": "Rotate ccw icon",
  "rotate-cw": "Rotate cw icon",
  "rss": "RSS icon",
  "save": "Save icon",
  "scissors": "Scissors icon",
  "search": "Search icon",
  "send": "Send icon",
  "server": "Server icon",
  "settings": "Settings icon",
  "share": "Share icon",
  "share-2": "Share 2 icon",
  "shield": "Shield icon",
  "shield-off": "Shield off icon",
  "shuffle": "Shuffle icon",
  "sidebar": "Sidebar icon",
  "skip-back": "Skip back icon",
  "skip-forward": "Skip forward icon",
  "slack": "Slack icon",
  "slash": "Slash icon",
  "sliders": "Sliders icon",
  "smartphone": "Smartphone icon",
  "smile": "Smile icon",
  "speaker": "Speaker icon",
  "square": "Square icon",
  "star": "Star icon",
  "stop-circle": "Stop circle icon",
  "sun": "Sun icon",
  "sunrise": "Sunrise icon",
  "sunset": "Sunset icon",
  "tablet": "Tablet icon",
  "tag": "Tag icon",
  "target": "Target icon",
  "terminal": "Terminal icon",
  "thermometer": "Thermometer icon",
  "thumbs-down": "Thumbs down icon",
  "thumbs-up": "Thumbs up icon",
  "toggle-left": "Toggle left icon",
  "toggle-right": "Toggle right icon",
  "tool": "Tool icon",
  "trash": "Trash icon",
  "trash-2": "Trash 2 icon",
  "trending-down": "Trending down icon",
  "trending-up": "Trending up icon",
  "triangle": "Triangle icon",
  "truck": "Truck icon",
  "tv": "TV icon",
  "twitch": "Twitch icon",
  "twitter": "Twitter icon",
  "type": "Type icon",
  "umbrella": "Umbrella icon",
  "underline": "Underline icon",
  "unlock": "Unlock icon",
  "upload": "Upload icon",
  "upload-cloud": "Upload cloud icon",
  "user": "User icon",
  "user-check": "User check icon",
  "user-minus": "User minus icon",
  "user-plus": "User plus icon",
  "user-x": "User x icon",
  "users": "Users icon",
  "video": "Video icon",
  "video-off": "Video off icon",
  "voicemail": "Voicemail icon",
  "volume": "Volume icon",
  "volume-1": "Volume 1 icon",
  "volume-2": "Volume 2 icon",
  "volume-x": "Volume x icon",
  "watch": "Watch icon",
  "wifi": "WiFi icon",
  "wifi-off": "WiFi off icon",
  "wind": "Wind icon",
  "x": "X icon",
  "x-circle": "X circle icon",
  "x-octagon": "X octagon icon",
  "x-square": "X square icon",
  "youtube": "YouTube icon",
  "zap": "Zap icon",
  "zap-off": "Zap off icon",
  "zoom-in": "Zoom in icon",
  "zoom-out": "Zoom out icon"
};

function getAllIcons() {
  return lucideIcons;
}

function searchIcons(query) {
  const searchTerm = query.toLowerCase();
  return Object.entries(lucideIcons)
    .filter(([name, description]) => 
      name.toLowerCase().includes(searchTerm) || 
      description.toLowerCase().includes(searchTerm)
    )
    .reduce((acc, [name, description]) => {
      acc[name] = description;
      return acc;
    }, {});
}

function getIconInfo(iconName) {
  const iconInfo = lucideIcons[iconName];
  if (!iconInfo) {
    return {
      error: `Icon "${iconName}" not found.`,
      available: Object.keys(lucideIcons).slice(0, 20).join(", ") + "..."
    };
  }

  return {
    name: iconName,
    description: iconInfo,
    importStatement: `import { ${iconName.charAt(0).toUpperCase() + iconName.slice(1)} } from 'lucide-react';`,
    usage: `<${iconName.charAt(0).toUpperCase() + iconName.slice(1)} />`
  };
}

function generateIconComponent(iconName) {
  const iconInfo = getIconInfo(iconName);
  if (iconInfo.error) {
    return iconInfo;
  }

  return {
    ...iconInfo,
    componentCode: `import { ${iconInfo.importStatement.split(' ')[1]} } from 'lucide-react';

function ${iconName.charAt(0).toUpperCase() + iconName.slice(1)}Icon({ size = 24, color = "currentColor", ...props }) {
  return <${iconInfo.importStatement.split(' ')[1]} size={size} color={color} {...props} />;
}

export default ${iconName.charAt(0).toUpperCase() + iconName.slice(1)}Icon;`
  };
}

// CLI 인터페이스
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'list':
    console.log(JSON.stringify(getAllIcons(), null, 2));
    break;
  
  case 'search':
    if (!args[0]) {
      console.log('Usage: node scripts/lucide-icons-helper.js search <query>');
      process.exit(1);
    }
    console.log(JSON.stringify(searchIcons(args[0]), null, 2));
    break;
  
  case 'info':
    if (!args[0]) {
      console.log('Usage: node scripts/lucide-icons-helper.js info <icon-name>');
      process.exit(1);
    }
    console.log(JSON.stringify(getIconInfo(args[0]), null, 2));
    break;
  
  case 'generate':
    if (!args[0]) {
      console.log('Usage: node scripts/lucide-icons-helper.js generate <icon-name>');
      process.exit(1);
    }
    console.log(JSON.stringify(generateIconComponent(args[0]), null, 2));
    break;
  
  default:
    console.log(`
Lucide Icons Helper

사용법:
  node scripts/lucide-icons-helper.js <command> [args]

명령어:
  list                    - 모든 아이콘 목록 표시
  search <query>          - 아이콘 검색
  info <icon-name>        - 특정 아이콘 정보
  generate <icon-name>    - 아이콘 컴포넌트 생성

예시:
  node scripts/lucide-icons-helper.js list
  node scripts/lucide-icons-helper.js search "user"
  node scripts/lucide-icons-helper.js info "user"
  node scripts/lucide-icons-helper.js generate "user"
`);
    break;
} 