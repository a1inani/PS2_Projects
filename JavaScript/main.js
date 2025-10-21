// AthenaEnv File Manager Dashboard
// Save this as main.js to use as your dashboard

const font = new Font("default");
const pad = Pads.get(0);

// File manager state
const state = {
    currentPath: "cdfs:/",  // Change to your desired starting path
    files: [],
    selectedIndex: 0,
    scrollOffset: 0,
    maxVisible: 15,
    isLoading: true,
    errorMessage: null,
    statusMessage: null
};

// Colors
const BG_COLOR = Color.new(20, 20, 30, 128);
const HEADER_COLOR = Color.new(40, 40, 60, 128);
const SELECTED_COLOR = Color.new(80, 120, 200, 128);
const TEXT_COLOR = Color.new(255, 255, 255, 128);
const FOLDER_COLOR = Color.new(100, 200, 255, 128);
const FILE_COLOR = Color.new(200, 200, 200, 128);
const JS_COLOR = Color.new(255, 220, 100, 128);
const SUCCESS_COLOR = Color.new(100, 255, 100, 128);
const ERROR_COLOR = Color.new(255, 100, 100, 128);

// Load files from current directory
function loadDirectory(path) {
    state.isLoading = true;
    state.errorMessage = null;
    state.statusMessage = null;
    
    try {
        // Normalize path
        if (!path.endsWith('/')) {
            path = path + '/';
        }
        
        const dirList = System.listDir(path);
        
        if (!dirList || dirList.length === 0) {
            state.files = [];
            state.statusMessage = "Empty directory";
            state.isLoading = false;
            return;
        }
        
        // Sort: directories first, then files
        state.files = dirList.sort((a, b) => {
            if (a.directory && !b.directory) return -1;
            if (!a.directory && b.directory) return 1;
            return a.name.localeCompare(b.name);
        });
        
        // Add parent directory option if not at root
        if (path !== "mass:/" && path !== "cdfs:/" && path !== "mc0:/" && path !== "mc1:/") {
            state.files.unshift({ name: "..", directory: true, size: 0 });
        }
        
        state.currentPath = path;
        state.selectedIndex = 0;
        state.scrollOffset = 0;
        
    } catch (e) {
        state.errorMessage = `Error: ${e.toString()}`;
        state.files = [];
        std.printf("Directory load error: %s\n", e.toString());
    } finally {
        state.isLoading = false;
    }
}

// Get parent directory
function getParentPath(path) {
    // Remove trailing slash
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    
    const parts = path.split('/').filter(p => p.length > 0);
    
    // If at device root
    if (parts.length <= 1) {
        return parts[0] + ':/';
    }
    
    parts.pop();
    return parts.join('/') + '/';
}

// Build full file path
function getFullPath(file) {
    let path = state.currentPath;
    
    // Ensure path ends with /
    if (!path.endsWith('/')) {
        path = path + '/';
    }
    
    return path + file.name;
}

// Execute/open selected file
function openFile(file) {
    if (file.directory) {
        if (file.name === "..") {
            state.currentPath = getParentPath(state.currentPath);
        } else {
            const fullPath = getFullPath(file);
            state.currentPath = fullPath;
            if (!state.currentPath.endsWith('/')) {
                state.currentPath += '/';
            }
        }
        loadDirectory(state.currentPath);
        return;
    }
    
    // Handle file execution
    if (!file.name.endsWith('.js')) {
        state.errorMessage = "Can only run .js files";
        return;
    }
    
    const fullPath = getFullPath(file);
    
    std.printf("Attempting to load: %s\n", fullPath);
    
    try {
        // Method 1: Check if file exists first
        if (!std.exists(fullPath)) {
            state.errorMessage = `File not found: ${fullPath}`;
            std.printf("File does not exist: %s\n", fullPath);
            return;
        }
        
        std.printf("File exists, attempting to load...\n");
        
        // Method 2: Load and execute with std.loadScript
        try {
            std.loadScript(fullPath);
            // If we get here, script loaded successfully
            std.printf("Script loaded successfully!\n");
        } catch (loadError) {
            // Try alternative method with std.reload
            std.printf("loadScript failed, trying reload: %s\n", loadError.toString());
            state.errorMessage = `Loading ${file.name}...`;
            
            // Small delay to show message
            os.setTimeout(() => {
                try {
                    std.reload(fullPath);
                } catch (reloadError) {
                    state.errorMessage = `Failed to load: ${reloadError.toString()}`;
                    std.printf("Reload error: %s\n", reloadError.toString());
                }
            }, 100);
        }
        
    } catch (e) {
        state.errorMessage = `Error: ${e.toString()}`;
        std.printf("Load error: %s\n", e.toString());
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
    font.print(10, 10, "Dashboard");
    
    // Current path
    font.scale = 0.8;
    font.print(10, 50, `Path: ${state.currentPath}`);
    
    // Instructions
    font.print(10, 420, "D-Pad: Navigate | X: Open/Run | O: Back | Triangle: Device | Square: Refresh");
    
    // Status message
    if (state.statusMessage) {
        font.color = SUCCESS_COLOR;
        font.print(10, 400, state.statusMessage);
        font.color = TEXT_COLOR;
    }
    
    // Error message
    if (state.errorMessage) {
        font.color = ERROR_COLOR;
        font.print(10, 400, state.errorMessage);
        font.color = TEXT_COLOR;
    }
    
    // Loading indicator
    if (state.isLoading) {
        font.scale = 1.0;
        font.print(250, 200, "Loading...");
        return;
    }
    
    // Empty directory message
    if (state.files.length === 0) {
        font.scale = 1.0;
        font.print(200, 200, "Empty Directory");
        font.scale = 0.8;
        font.print(180, 230, "Press Triangle to change device");
        return;
    }
    
    // File list
    const startY = 80;
    const lineHeight = 20;
    
    // Calculate visible range
    if (state.selectedIndex < state.scrollOffset) {
        state.scrollOffset = state.selectedIndex;
    }
    if (state.selectedIndex >= state.scrollOffset + state.maxVisible) {
        state.scrollOffset = state.selectedIndex - state.maxVisible + 1;
    }
    
    const visibleStart = state.scrollOffset;
    const visibleEnd = Math.min(visibleStart + state.maxVisible, state.files.length);
    
    font.scale = 0.8;
    
    for (let i = visibleStart; i < visibleEnd; i++) {
        const file = state.files[i];
        const y = startY + (i - visibleStart) * lineHeight;
        
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
        const icon = file.directory ? "[DIR]" : "[FILE]";
        font.print(10, y, icon);
        
        // Draw filename
        const displayName = file.name.length > 50 ? file.name.substring(0, 47) + "..." : file.name;
        font.print(70, y, displayName);
        
        // Draw file size (if not directory)
        if (!file.directory) {
            font.color = TEXT_COLOR;
            font.print(500, y, formatSize(file.size));
        }
    }
    
    // Scrollbar indicator
    if (state.files.length > state.maxVisible) {
        const scrollbarHeight = 300;
        const scrollbarY = 80;
        const thumbHeight = Math.max(20, (state.maxVisible / state.files.length) * scrollbarHeight);
        const thumbY = scrollbarY + (state.scrollOffset / state.files.length) * scrollbarHeight;
        
        Draw.rect(635, scrollbarY, 3, scrollbarHeight, Color.new(60, 60, 80, 128));
        Draw.rect(634, thumbY, 5, thumbHeight, Color.new(120, 120, 150, 128));
    }
    
    // File count and selection info
    font.color = TEXT_COLOR;
    font.scale = 0.7;
    font.print(480, 50, `${state.selectedIndex + 1}/${state.files.length} items`);
}

// Handle input
function handleInput() {
    pad.update();
    
    if (state.files.length === 0 && !state.isLoading) {
        // Allow device switching even with empty directory
        if (pad.justPressed(Pads.TRIANGLE)) {
            switchDevice();
        }
        if (pad.justPressed(Pads.SQUARE)) {
            loadDirectory(state.currentPath);
        }
        return;
    }
    
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
        const file = state.files[state.selectedIndex];
        openFile(file);
    }
    
    // Go back (Circle button)
    if (pad.justPressed(Pads.CIRCLE)) {
        if (state.currentPath !== "mass:/" && state.currentPath !== "cdfs:/" && 
            state.currentPath !== "mc0:/" && state.currentPath !== "mc1:/") {
            state.currentPath = getParentPath(state.currentPath);
            loadDirectory(state.currentPath);
        }
    }
    
    // Refresh directory (Square)
    if (pad.justPressed(Pads.SQUARE)) {
        loadDirectory(state.currentPath);
    }
    
    // Switch device (Triangle)
    if (pad.justPressed(Pads.TRIANGLE)) {
        switchDevice();
    }
}

// Switch between devices
function switchDevice() {
    const devices = ["cdfs:/", "mass:/", "mc0:/", "mc1:/"];
    let currentIndex = devices.indexOf(state.currentPath.split('/')[0] + ':/');
    
    if (currentIndex === -1) currentIndex = 0;
    
    currentIndex = (currentIndex + 1) % devices.length;
    state.currentPath = devices[currentIndex];
    
    state.statusMessage = `Switched to ${state.currentPath}`;
    loadDirectory(state.currentPath);
}

// Debug: Print initial info
std.printf("=== Dashboard Started ===\n");
std.printf("Initial path: %s\n", state.currentPath);
std.printf("Platform: %s\n", os.platform);

// Initialize
loadDirectory(state.currentPath);

// Main loop
os.setInterval(() => {
    handleInput();
    draw();
    Screen.flip();
}, 0);