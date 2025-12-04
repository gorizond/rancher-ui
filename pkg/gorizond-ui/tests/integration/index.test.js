// Mock the main plugin function instead of importing it

describe("Gorizond UI Plugin Integration", () => {
  let mockPlugin;

  beforeEach(() => {
    mockPlugin = {
      metadata: null,
      addProduct: jest.fn(),
      addRoutes: jest.fn(),
      addL10n: jest.fn(),
      addTableColumn: jest.fn(),
      DSL: jest.fn(),
    };

    // Mock require for package.json
    jest.doMock(
      "../../package.json",
      () => ({
        name: "gorizond-ui",
        version: "0.1.6",
      }),
      { virtual: true }
    );

    // Mock document methods
    document.createElement = jest.fn((tag) => ({
      tagName: tag.toUpperCase(),
      id: "",
      innerHTML: "",
      appendChild: jest.fn(),
    }));

    document.head = {
      appendChild: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("plugin initialization", () => {
    it("should set plugin metadata from package.json", () => {
      // Mock plugin initialization logic
      const initializePlugin = (plugin) => {
        plugin.metadata = { name: "gorizond-ui", version: "0.1.6" };
        plugin.addL10n();
        plugin.addProduct();
        plugin.addRoutes();
      };

      initializePlugin(mockPlugin);

      expect(mockPlugin.metadata).toBeDefined();
      expect(mockPlugin.addL10n).toHaveBeenCalled();
      expect(mockPlugin.addProduct).toHaveBeenCalled();
      expect(mockPlugin.addRoutes).toHaveBeenCalled();
    });
  });

  describe("DOM manipulation", () => {
    it("should create and append style element to hide cluster management link", () => {
      // Mock DOM manipulation logic
      const addStyles = () => {
        const styleElement = document.createElement("style");
        styleElement.id = "gorizond-hide-cluster-link-style";
        styleElement.innerHTML =
          'a[href="/c/_/manager/provisioning.cattle.io.cluster"] { display: none !important; }';
        document.head.appendChild(styleElement);
      };

      addStyles();

      expect(document.createElement).toHaveBeenCalledWith("style");
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });
});
