// AthenaEnv File Manager Dashboard
// Save this as main.js to use as your dashboard
//
// NOTE: When you select a .js file, it will reload the entire environment
// with that script. To return to this file manager, your apps should call:
// std.reload("host:/main.js");  // or wherever this file is located

var font = new Font("default");
var pad = Pads.get(0);

// File manager state
var state = {
    currentPath: "host:/",  // HostFS path for PCSX2, change to "mass:/" for USB on real PS2
    files: [],
    selectedIndex: 0,
    scrollOffset: 0,
    maxVisible: 15,
    isLoading: true,
    errorMessage: null,
    availableDevices: ["host:/", "mass:/", "cdfs:/", "mc0:/", "mc1:/"],
    currentDeviceIndex: 0,
    mainLoopHandle: null  // Store the interval handle so we can stop it
};

// Colors
var BG_COLOR = Color.new(20, 20, 30, 128);
var HEADER_COLOR = Color.new(40, 40, 60, 128);
var SELECTED_COLOR = Color.new(80, 120, 200, 128);
var TEXT_COLOR = Color.new(255, 255, 255, 128);
var FOLDER_COLOR = Color.new(100, 200, 255, 128);
var FILE_COLOR = Color.new(200, 200, 200, 128);
var JS_COLOR = Color.new(255, 220, 100, 128);

// Load files from current directory
function loadDirectory(path) {
    state.isLoading = true;
    state.errorMessage = null;
    
    try {
        var dirList = System.listDir(path);
        
        if (!dirList || dirList.length === 0) {
            state.files = [];
            state.errorMessage = "Empty directory";
            return;
        }
        
        // Filter: only directories and .js files
        var filtered = dirList.filter(item => {
            return item.directory || item.name.endsWith('.js');
        });
        
        // Sort: directories first, then files
        state.files = filtered.sort((a, b) => {
            if (a.directory && !b.directory) return -1;
            if (!a.directory && b.directory) return 1;
            return a.name.localeCompare(b.name);
        });
        
        // Add parent directory option if not at root
        if (path !== "mass:/" && path !== "cdfs:/") {
            state.files.unshift({ name: "..", directory: true, size: 0 });
        }
        
        state.selectedIndex = 0;
        state.scrollOffset = 0;
        
    } catch (e) {
        state.errorMessage = `Error loading directory: ${e}`;
        state.files = [];
    } finally {
        state.isLoading = false;
    }
}

// Get parent directory
function getParentPath(path) {
    var parts = path.split('/').filter(p => p.length > 0);
    if (parts.length <= 1) {
        // Return to root of current device
        return parts[0] + '/';
    }
    parts.pop();
    return parts.join('/') + '/';
}

// Execute/open selected file
function openFile(file) {
    const fullPath = state.currentPath + file.name;
    
    if (file.directory) {
        if (file.name === "..") {
            state.currentPath = getParentPath(state.currentPath);
        } else {
            state.currentPath = fullPath + '/';
        }
        loadDirectory(state.currentPath);
    } else {
        // Only JavaScript files are shown, so this should always work
        if (file.name.endsWith('.js')) {
            try {
                // Check if file exists first
                if (!std.exists(fullPath)) {
                    state.errorMessage = `File not found: ${fullPath}`;
                    return;
                }
                
                // Load the file content
                var content = std.loadFile(fullPath);
                if (!content) {
                    state.errorMessage = `Could not read file: ${fullPath}`;
                    return;
                }
                
                // Stop the file manager loop
                if (state.mainLoopHandle) {
                    os.clearInterval(state.mainLoopHandle);
                    state.mainLoopHandle = null;
                }
                
                // Clear the screen before launching
                Screen.clear();
                Screen.flip();
                
                // Execute the script
                std.evalScript(content);
                
            } catch (e) {
                state.errorMessage = `Error: ${e.toString()}`;
            }
        }
    }
}

// Format file size
function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Draw the UI
function draw() {
    Screen.clear(BG_COLOR);
    
    // Header
    Draw.rect(0, 0, 640, 40, HEADER_COLOR);
    font.color = TEXT_COLOR;
    font.scale = 1.0;
    font.print(10, 10, "AthenaEnv File Manager - JavaScript Files Only");
    
    // Current path and device
    font.scale = 0.8;
    font.print(10, 50, `Path: ${state.currentPath}`);
    font.print(10, 70, `Device: ${state.availableDevices[state.currentDeviceIndex]} (Triangle to cycle)`);
    
    // Instructions
    font.print(10, 420, "D-Pad: Navigate | X: Run | O: Back | Triangle: Cycle Device | Start: Reload");
    
    // Error message
    if (state.errorMessage) {
        font.color = Color.new(255, 100, 100, 128);
        font.scale = 0.7;
        font.print(10, 400, state.errorMessage);
        font.color = TEXT_COLOR;
        font.scale = 0.8;
    }
    
    // Loading indicator
    if (state.isLoading) {
        font.scale = 1.0;
        font.print(250, 200, "Loading...");
        return;
    }
    
    // File list
    var startY = 100;
    var lineHeight = 20;
    
    // Calculate visible range
    if (state.selectedIndex < state.scrollOffset) {
        state.scrollOffset = state.selectedIndex;
    }
    if (state.selectedIndex >= state.scrollOffset + state.maxVisible) {
        state.scrollOffset = state.selectedIndex - state.maxVisible + 1;
    }
    
    var visibleStart = state.scrollOffset;
    var visibleEnd = Math.min(visibleStart + state.maxVisible, state.files.length);
    
    font.scale = 0.8;
    
    for (let i = visibleStart; i < visibleEnd; i++) {
        var file = state.files[i];
        var y = startY + (i - visibleStart) * lineHeight;
        
        // Draw selection highlight
        if (i === state.selectedIndex) {
            Draw.rect(5, y - 2, 630, lineHeight, SELECTED_COLOR);
        }
        
        // Set color based on file type
        if (file.directory) {
            font.color = FOLDER_COLOR;
        } else if (file.name.endsWith('.js')) {
            font.color = JS_COLOR;
        } else {
            font.color = FILE_COLOR;
        }
        
        // Draw icon
        var icon = file.directory ? "[DIR]" : "[JS]";
        font.print(10, y, icon);
        
        // Draw filename
        font.print(70, y, file.name);
        
        // Draw file size (if not directory)
        if (!file.directory) {
            font.color = TEXT_COLOR;
            font.print(500, y, formatSize(file.size));
        }
    }
    
    // Scrollbar indicator
    if (state.files.length > state.maxVisible) {
        var scrollbarHeight = 280;
        var scrollbarY = 100;
        var thumbHeight = Math.max(20, (state.maxVisible / state.files.length) * scrollbarHeight);
        var thumbY = scrollbarY + (state.scrollOffset / state.files.length) * scrollbarHeight;
        
        Draw.rect(635, scrollbarY, 3, scrollbarHeight, Color.new(60, 60, 80, 128));
        Draw.rect(634, thumbY, 5, thumbHeight, Color.new(120, 120, 150, 128));
    }
    
    // File count
    font.color = TEXT_COLOR;
    font.scale = 0.7;
    font.print(550, 70, `${state.files.length} items`);
}

// Handle input
function handleInput() {
    pad.update();
    
    if (state.files.length === 0) return;
    
    // Navigation
    if (pad.justPressed(Pads.UP)) {
        state.selectedIndex = Math.max(0, state.selectedIndex - 1);
        state.errorMessage = null;
    }
    
    if (pad.justPressed(Pads.DOWN)) {
        state.selectedIndex = Math.min(state.files.length - 1, state.selectedIndex + 1);
        state.errorMessage = null;
    }
    
    // Page up/down with L1/R1
    if (pad.justPressed(Pads.L1)) {
        state.selectedIndex = Math.max(0, state.selectedIndex - state.maxVisible);
        state.errorMessage = null;
    }
    
    if (pad.justPressed(Pads.R1)) {
        state.selectedIndex = Math.min(state.files.length - 1, state.selectedIndex + state.maxVisible);
        state.errorMessage = null;
    }
    
    // Open/Execute file
    if (pad.justPressed(Pads.CROSS)) {
        var file = state.files[state.selectedIndex];
        openFile(file);
    }
    
    // Go back (Circle button)
    if (pad.justPressed(Pads.CIRCLE)) {
        var rootPaths = ["host:/", "mass:/", "cdfs:/", "mc0:/", "mc1:/"];
        if (!rootPaths.includes(state.currentPath)) {
            state.currentPath = getParentPath(state.currentPath);
            loadDirectory(state.currentPath);
        }
    }
    
    // Cycle through devices (Triangle)
    if (pad.justPressed(Pads.TRIANGLE)) {
        state.currentDeviceIndex = (state.currentDeviceIndex + 1) % state.availableDevices.length;
        state.currentPath = state.availableDevices[state.currentDeviceIndex];
        loadDirectory(state.currentPath);
    }
    
    // Reload current directory (Start)
    if (pad.justPressed(Pads.START)) {
        loadDirectory(state.currentPath);
    }
}

// Initialize
loadDirectory(state.currentPath);

// Main loop
state.mainLoopHandle = os.setInterval(() => {
    handleInput();
    draw();
    Screen.flip();
}, 0);