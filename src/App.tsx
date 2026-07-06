import React, { useState, useEffect, useRef, FormEvent } from "react";
import {
  Pizza,
  ShoppingCart,
  Star,
  Clock,
  MapPin,
  Phone,
  Calendar,
  Users,
  Check,
  Trash2,
  ChevronRight,
  Menu as MenuIcon,
  X,
  Plus,
  Minus,
  Send,
  Sparkles,
  UtensilsCrossed,
  MessageSquare,
  BadgePercent,
  CheckCircle,
  TrendingUp,
  Map,
  ChevronDown
} from "lucide-react";

// Types
interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: "specialty" | "classic" | "sides" | "drinks";
  prices: {
    small: number;
    medium: number;
    large: number;
  };
  image: string;
  isPopular?: boolean;
}

interface CartItem {
  cartId: string;
  id: string;
  name: string;
  size: "small" | "medium" | "large";
  crust: "Pan" | "Thin" | "Stuffed Crust";
  price: number;
  quantity: number;
  extraToppings: string[];
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  isGoogleReview?: boolean;
}

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  section: string;
  status: "Confirmed" | "Pending";
}

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"menu" | "configurator" | "reservations" | "reviews">("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuFilter, setMenuFilter] = useState<string>("all");
  
  // Customizer/Configurator state
  const [configPizza, setConfigPizza] = useState({
    name: "Craft Your Own Cabin Pizza",
    size: "medium" as "small" | "medium" | "large",
    crust: "Pan" as "Pan" | "Thin" | "Stuffed Crust",
    cheeseLevel: "Normal" as "Light" | "Normal" | "Extra",
    toppings: ["Malai Chicken Boti"] as string[]
  });

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  
  // Reservation states
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [newReservation, setNewReservation] = useState({
    name: "",
    phone: "",
    date: "",
    time: "19:00",
    guests: 2,
    section: "Family Lounge"
  });
  const [reservationSuccess, setReservationSuccess] = useState(false);

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details" | "success">("cart");
  const [checkoutDetails, setCheckoutDetails] = useState({
    name: "",
    phone: "",
    deliveryType: "delivery" as "delivery" | "takeout",
    address: "",
    paymentMethod: "cod" as "cod" | "easypaisa" | "bank"
  });
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    items: CartItem[];
    total: number;
    time: string;
    status: number; // 0: Received, 1: Kitchen, 2: Out for Delivery, 3: Completed
  } | null>(null);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- STATIC CONSTANTS ---
  const BASE_PRICES = {
    small: 500,
    medium: 980,
    large: 1450
  };

  const TOPPING_PRICES: { [key: string]: number } = {
    "Malai Chicken Boti": 150,
    "Seekh Kabab Chunks": 150,
    "Smoked Pepperoni": 120,
    "Double Cheese": 130,
    "Sweet Bell Peppers": 60,
    "Mushrooms": 70,
    "Jalapenos": 60,
    "Red Onions": 40,
    "Olives": 50,
    "Sweet Corn": 40
  };

  const menuItems: MenuItem[] = [
    {
      id: "malai-boti",
      name: "Malai Boti Pizza",
      description: "Creamy white sauce base, tender grilled Malai chicken boti chunks, fresh coriander, sweet red onions, and hand-stretched mozzarella. Our absolute bestseller!",
      category: "specialty",
      prices: { small: 600, medium: 1200, large: 1800 },
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
      isPopular: true
    },
    {
      id: "kabab-pizza",
      name: "Sargodha Kabab Feast",
      description: "Artisanal seekh kabab pieces, rustic bell peppers, marinated red onions, rich clay-oven house sauce, with double melted cheese and direct spices.",
      category: "specialty",
      prices: { small: 580, medium: 1150, large: 1750 },
      image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=600&q=80",
      isPopular: true
    },
    {
      id: "margherita",
      name: "The Original Margherita",
      description: "Classic hand-crushed Italian tomato base, pure double milk mozzarella, a delicate drizzle of extra virgin olive oil, and fresh aromatic basil leaves.",
      category: "classic",
      prices: { small: 480, medium: 950, large: 1450 },
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "cabin-special",
      name: "Cabin Deluxe Special",
      description: "Loaded combination of spiced grilled chicken, juicy beef pepperoni, black olives, baby mushrooms, jalapeños, and our secret Pizza Cabin garlic sauce.",
      category: "specialty",
      prices: { small: 650, medium: 1300, large: 1950 },
      image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80",
      isPopular: true
    },
    {
      id: "tikka-sensation",
      name: "Spicy Chicken Tikka",
      description: "Sizzling oven-roasted chicken tikka cubes, crunchy red bell peppers, local red onions, sprinkle of wild oregano, and traditional rich tomato sauce.",
      category: "classic",
      prices: { small: 550, medium: 1100, large: 1650 },
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "masala-fries",
      name: "Loaded Masala Fries",
      description: "Golden crispy skin-on french fries tossed in traditional secret spice mix, smothered with melted cheddar cheese sauce and local herbs.",
      category: "sides",
      prices: { small: 220, medium: 350, large: 480 },
      image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "chicken-wings",
      name: "Smoked Cabin Wings",
      description: "6 pieces of juicy, tender chicken wings oven-baked and glazed with a perfect balance of spicy buffalo glaze or sweet amber honey sauce.",
      category: "sides",
      prices: { small: 280, medium: 450, large: 620 },
      image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "garlic-bread",
      name: "Garlic Bread with Cheese",
      description: "Thick freshly baked French baguette slices brushed with organic garlic herb butter, toasted until crisp, topped with golden mozzarella cheese.",
      category: "sides",
      prices: { small: 180, medium: 280, large: 390 },
      image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "mint-margarita",
      name: "Fresh Mint Margarita",
      description: "A frosty, refreshing blend of crushed fresh garden mint, zesty lime juice, ice slush, and sparkling lemon-lime tonic.",
      category: "drinks",
      prices: { small: 150, medium: 250, large: 350 },
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "soft-drink",
      name: "Soft Drink (Ice-Cold)",
      description: "Your choice of ice-cold refreshing soft drinks (Pepsi, Coke, 7Up, Dew, Sprite). Perfect companion for warm baked pizzas.",
      category: "drinks",
      prices: { small: 100, medium: 150, large: 200 },
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const defaultReviews: Review[] = [
    {
      id: "rev-1",
      name: "Zain Ali",
      rating: 5,
      comment: "The Malai Boti Pizza is out of this world! It's so creamy and loaded. Hands down the best pizza experience in Sargodha. Excellent family environment too.",
      date: "2026-06-28",
      isGoogleReview: true
    },
    {
      id: "rev-2",
      name: "Kashif Mahmood",
      rating: 5,
      comment: "Awesome taste, friendly and welcoming staff. The Kabab Pizza is perfectly spiced. Love that they are open 24 hours so we can satisfy late night cravings!",
      date: "2026-06-20",
      isGoogleReview: true
    },
    {
      id: "rev-3",
      name: "Ayesha Bibi",
      rating: 5,
      comment: "Very budget friendly prices considering the premium taste they offer. Margherita was so light and premium. My kids absolutely love Pizza Cabin.",
      date: "2026-07-02",
      isGoogleReview: true
    },
    {
      id: "rev-4",
      name: "M. Ibrahim",
      rating: 4,
      comment: "Great location near Siraj Colony and the service is super fast. Malai Boti is highly recommended. Will definitely order again!",
      date: "2026-07-04",
      isGoogleReview: true
    }
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load local storage values
    const cachedReviews = localStorage.getItem("pizza_cabin_reviews");
    if (cachedReviews) {
      setReviews(JSON.parse(cachedReviews));
    } else {
      setReviews(defaultReviews);
      localStorage.setItem("pizza_cabin_reviews", JSON.stringify(defaultReviews));
    }

    const cachedReservations = localStorage.getItem("pizza_cabin_reservations");
    if (cachedReservations) {
      setReservations(JSON.parse(cachedReservations));
    } else {
      const initialBookings: Reservation[] = [
        {
          id: "res-901",
          name: "Sample Reservation",
          phone: "03001234567",
          date: "2026-07-06",
          time: "20:00",
          guests: 4,
          section: "Family Lounge",
          status: "Confirmed"
        }
      ];
      setReservations(initialBookings);
      localStorage.setItem("pizza_cabin_reservations", JSON.stringify(initialBookings));
    }

    const cachedCart = localStorage.getItem("pizza_cabin_cart");
    if (cachedCart) {
      setCart(JSON.parse(cachedCart));
    }
  }, []);

  // --- HELPER HANDLERS ---
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const updateCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("pizza_cabin_cart", JSON.stringify(newCart));
  };

  const addToCart = (item: MenuItem, size: "small" | "medium" | "large") => {
    const price = item.prices[size];
    const cartId = `${item.id}-${size}-${Date.now()}`;
    const newCartItem: CartItem = {
      cartId,
      id: item.id,
      name: item.name,
      size,
      crust: "Pan",
      price,
      quantity: 1,
      extraToppings: []
    };
    updateCartState([...cart, newCartItem]);
    triggerNotification(`Added 1x ${item.name} (${size}) to your order!`);
  };

  const addCustomPizzaToCart = () => {
    const basePrice = BASE_PRICES[configPizza.size];
    const toppingCost = configPizza.toppings.reduce(
      (sum, topping) => sum + (TOPPING_PRICES[topping] || 0),
      0
    );
    const totalItemPrice = basePrice + toppingCost;
    const cartId = `custom-${configPizza.size}-${Date.now()}`;
    
    const newCartItem: CartItem = {
      cartId,
      id: "custom-pizza",
      name: `Custom Cabin Pizza (${configPizza.size})`,
      size: configPizza.size,
      crust: configPizza.crust,
      price: totalItemPrice,
      quantity: 1,
      extraToppings: [...configPizza.toppings]
    };

    updateCartState([...cart, newCartItem]);
    triggerNotification("Your custom artisanal pizza has been added to the order!");
    setIsCartOpen(true);
  };

  const updateCartQty = (cartId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });
    updateCartState(updated);
  };

  const removeCartItem = (cartId: string) => {
    const updated = cart.filter(item => item.cartId !== cartId);
    updateCartState(updated);
    triggerNotification("Item removed from your order.");
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return 0;
    const delivery = checkoutDetails.deliveryType === "delivery" ? 150 : 0;
    const tax = Math.round(subtotal * 0.05); // 5% provincial sales tax
    return subtotal + delivery + tax;
  };

  // Reservation booking
  const handleBookTable = (e: FormEvent) => {
    e.preventDefault();
    if (!newReservation.name || !newReservation.phone || !newReservation.date) {
      triggerNotification("Please fill out all reservation fields.");
      return;
    }

    const booking: Reservation = {
      id: `res-${Math.floor(100 + Math.random() * 900)}`,
      name: newReservation.name,
      phone: newReservation.phone,
      date: newReservation.date,
      time: newReservation.time,
      guests: Number(newReservation.guests),
      section: newReservation.section,
      status: "Confirmed"
    };

    const updated = [booking, ...reservations];
    setReservations(updated);
    localStorage.setItem("pizza_cabin_reservations", JSON.stringify(updated));
    setReservationSuccess(true);
    setNewReservation({
      name: "",
      phone: "",
      date: "",
      time: "19:00",
      guests: 2,
      section: "Family Lounge"
    });
    triggerNotification("Table Reserved Successfully!");
  };

  // Cancel reservation
  const cancelReservation = (id: string) => {
    const updated = reservations.filter(r => r.id !== id);
    setReservations(updated);
    localStorage.setItem("pizza_cabin_reservations", JSON.stringify(updated));
    triggerNotification("Reservation has been cancelled.");
  };

  // Submit Review
  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      triggerNotification("Please type a name and review comment!");
      return;
    }

    const review: Review = {
      id: `rev-${Date.now()}`,
      name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem("pizza_cabin_reviews", JSON.stringify(updated));
    setNewReview({ name: "", rating: 5, comment: "" });
    triggerNotification("Thank you! Your feedback has been posted live.");
  };

  // Order placement
  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!checkoutDetails.name || !checkoutDetails.phone) {
      triggerNotification("Please fill in your name and phone number.");
      return;
    }
    if (checkoutDetails.deliveryType === "delivery" && !checkoutDetails.address) {
      triggerNotification("Please fill in your delivery address in Sargodha.");
      return;
    }

    const orderTotal = calculateTotal();
    const orderId = `PC-${Math.floor(1000 + Math.random() * 9000)}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const finalOrder = {
      orderId,
      items: [...cart],
      total: orderTotal,
      time,
      status: 0
    };

    setPlacedOrder(finalOrder);
    setCheckoutStep("success");
    updateCartState([]); // Clear cart
    triggerNotification("Order placed! Tracking initialized.");
  };

  // Simulate Order Tracker stages
  useEffect(() => {
    if (placedOrder && placedOrder.status < 3) {
      const interval = setInterval(() => {
        setPlacedOrder(prev => {
          if (!prev) return null;
          if (prev.status >= 3) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, status: prev.status + 1 };
        });
      }, 15000); // 15 seconds per stage for simulation
      return () => clearInterval(interval);
    }
  }, [placedOrder]);

  // Compute average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "4.9";

  // Filtered menu
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          item.description.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = menuFilter === "all" || item.category === menuFilter;
    return matchesSearch && matchesCategory;
  });

  // Toggle dynamic topping in Configurator
  const toggleConfigTopping = (topping: string) => {
    if (configPizza.toppings.includes(topping)) {
      setConfigPizza({
        ...configPizza,
        toppings: configPizza.toppings.filter(t => t !== topping)
      });
    } else {
      setConfigPizza({
        ...configPizza,
        toppings: [...configPizza.toppings, topping]
      });
    }
  };

  const getCustomPizzaPrice = () => {
    const base = BASE_PRICES[configPizza.size];
    const toppingsCost = configPizza.toppings.reduce(
      (sum, t) => sum + (TOPPING_PRICES[t] || 0),
      0
    );
    return base + toppingsCost;
  };

  return (
    <div className="min-h-screen bg-brand-cream selection:bg-brand-amber selection:text-white relative">
      
      {/* GLOBAL SYSTEM NOTIFICATION */}
      {notification && (
        <div id="notification-popup" className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-brand-amber/40 max-w-sm transition-all animate-bounce">
          <div className="w-2 h-2 rounded-full bg-brand-amber animate-ping"></div>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header id="main-header" className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md text-white border-b border-neutral-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          {/* Logo & Name */}
          <a href="#home" id="brand-logo-link" className="flex items-center gap-3 group">
            <div className="bg-brand-red p-2.5 rounded-xl text-white shadow-md shadow-brand-red/20 group-hover:rotate-12 transition-transform">
              <Pizza className="w-6 h-6" />
            </div>
            <div>
              <h1 id="brand-name" className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white group-hover:text-brand-amber transition-colors">
                Pizza Cabin
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                Sargodha • Open 24/7
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-300">
            <a href="#menu" className="hover:text-white transition-colors">Menu</a>
            <a href="#customizer" className="hover:text-white transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-amber" /> Pizza Maker
            </a>
            <a href="#reservation" className="hover:text-white transition-colors">Book Table</a>
            <a href="#reviews-section" className="hover:text-white transition-colors">Reviews</a>
            <a href="#location" className="hover:text-white transition-colors">Contact</a>
          </nav>

          {/* Action Buttons: Cart */}
          <div className="flex items-center gap-3">
            <button
              id="cart-btn"
              onClick={() => {
                setCheckoutStep("cart");
                setIsCartOpen(true);
              }}
              className="bg-brand-red hover:bg-brand-red/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-brand-red/25 flex items-center gap-2.5 transition-all hover:scale-[1.03] active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-brand-amber text-neutral-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-brand-dark">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Order Now</span>
              <span className="bg-brand-dark/30 px-1.5 py-0.5 rounded text-[11px] font-mono">
                Rs. {calculateSubtotal()}
              </span>
            </button>

            {/* Mobile Hamburger menu */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-neutral-300 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div id="mobile-nav-panel" className="md:hidden bg-brand-dark border-t border-neutral-800 text-sm font-semibold py-4 px-6 flex flex-col gap-4 animate-fadeIn">
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-amber py-2 border-b border-neutral-800"
            >
              Explore Menu
            </a>
            <a
              href="#customizer"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-amber py-2 border-b border-neutral-800 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-brand-amber" /> Artisanal Pizza Builder
            </a>
            <a
              href="#reservation"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-amber py-2 border-b border-neutral-800"
            >
              Table Reservations
            </a>
            <a
              href="#reviews-section"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-amber py-2 border-b border-neutral-800"
            >
              Reviews & Feedback
            </a>
            <a
              href="#location"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-amber py-2"
            >
              Contact & Location Map
            </a>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative overflow-hidden bg-brand-dark text-white pt-12 pb-20 sm:pb-24">
        {/* Aesthetic background design */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-brand-red rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-brand-amber rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Brand details */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-neutral-800/80 border border-neutral-700/60 rounded-full px-4 py-1.5 text-xs text-brand-amber font-bold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-brand-amber text-brand-amber" />
                <span>4.9/5 Star Rating from 35+ Local Reviews</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight leading-tight">
                Authentic Crust.<br />
                <span className="text-brand-amber font-normal italic">Legendary</span> Taste in Sargodha.
              </h2>
              
              <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium">
                Home of the iconic <span className="text-white font-bold underline decoration-brand-amber underline-offset-4">Malai Boti Pizza</span>. Fresh ingredients, hand-tossed dough, baked fresh inside clay oven heat, open 24/7 for you.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#menu"
                  className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-red/30 transition-transform hover:scale-[1.02] flex items-center gap-2 text-sm sm:text-base"
                >
                  Explore Our Menu
                  <ChevronRight className="w-4 h-4" />
                </a>
                <a
                  href="#customizer"
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-8 py-3.5 rounded-xl border border-neutral-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  <Sparkles className="w-4 h-4 text-brand-amber animate-pulse" />
                  Build Custom Pizza
                </a>
              </div>

              {/* Badges/Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 text-left border-t border-neutral-800 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-amber/15 p-2 rounded-lg text-brand-amber">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-bold">OPENING</p>
                    <p className="text-xs font-extrabold text-white">24 Hours Open</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-amber/15 p-2 rounded-lg text-brand-amber">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-bold">SERVICES</p>
                    <p className="text-xs font-extrabold text-white">Takeout & Delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-amber/15 p-2 rounded-lg text-brand-amber">
                    <BadgePercent className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-bold">PRICES</p>
                    <p className="text-xs font-extrabold text-white">Highly Budget Friendly</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-amber/15 p-2 rounded-lg text-brand-amber">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-bold">DINE-IN</p>
                    <p className="text-xs font-extrabold text-white">Family Environment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero interactive food element */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                
                {/* Visual Pizza spinning element */}
                <div className="absolute inset-0 rounded-full bg-brand-amber/25 blur-2xl animate-pulse"></div>
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
                  alt="Delicious Cabin Pizza"
                  className="w-full h-full object-cover rounded-full border-4 border-neutral-800 shadow-2xl relative z-10 rotate-[20deg]"
                />
                
                {/* Absolute overlay items */}
                <div className="absolute top-4 -left-6 z-20 bg-neutral-900/90 border border-brand-amber/40 rounded-2xl p-3 shadow-xl flex items-center gap-2">
                  <div className="bg-green-600/20 p-2 rounded-xl text-green-500">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-bold">MUST TRY ITEM</p>
                    <p className="text-xs font-extrabold text-white">Malai Boti Pizza</p>
                  </div>
                </div>

                <div className="absolute bottom-6 -right-6 z-20 bg-neutral-900/90 border border-brand-amber/40 rounded-2xl p-3 shadow-xl flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-bold">RATING</p>
                    <p className="text-xs font-extrabold text-white">4.9/5 Rating</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HIGHLIGHTED HERO ITEM: THE BESTSELLER MALAI BOTI PIZZA */}
      <section className="bg-neutral-100 py-12 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-neutral-200/60 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Visual */}
            <div className="md:col-span-5 h-64 sm:h-80 relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80"
                alt="Malai Boti Pizza Close-up"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-brand-red text-white text-xs font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-lg">
                Sargodha's Best Seller ⭐
              </span>
            </div>

            {/* Info */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-1.5 text-brand-red text-xs font-extrabold tracking-wide uppercase">
                <TrendingUp className="w-4 h-4" />
                <span>Most Frequently Highlighted by 35+ Reviewers</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-neutral-900">
                The Legendary Malai Boti Pizza
              </h3>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                Slow-marinated chicken breast cubes in cream, lemon juice, yogurt, and authentic white cardamom spices. Paired with soft hand-rolled dough, loaded mozzarella, sweet onions, and garnished fresh with diced local green chilies. Perfectly customized with crust types and dipping sauce.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 text-center">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase">Small (7")</p>
                  <p className="text-sm font-extrabold text-neutral-900 mt-1">Rs. 600</p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 text-center ring-2 ring-brand-amber/40">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase">Medium (10")</p>
                  <p className="text-sm font-extrabold text-neutral-900 mt-1">Rs. 1,200</p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 text-center">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase">Large (13")</p>
                  <p className="text-sm font-extrabold text-neutral-900 mt-1">Rs. 1,800</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    const item = menuItems.find(m => m.id === "malai-boti");
                    if (item) addToCart(item, "medium");
                  }}
                  className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm shadow-md transition-all active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" /> Add Medium to Order (Rs. 1,200)
                </button>
                <a
                  href="#customizer"
                  onClick={() => {
                    setConfigPizza({
                      name: "Artisanal Custom Pizza",
                      size: "medium",
                      crust: "Pan",
                      cheeseLevel: "Normal",
                      toppings: ["Malai Chicken Boti"]
                    });
                    setActiveTab("configurator");
                  }}
                  className="text-neutral-700 hover:text-brand-red font-bold text-xs flex items-center gap-1 border-b border-dashed border-neutral-400 hover:border-brand-red transition-all"
                >
                  Customize Toppings
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* THREE-TAB FUNCTIONAL MAIN INTERFACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Dynamic section control tabs */}
        <div className="flex justify-center border-b border-neutral-200 mb-8">
          <div className="flex gap-2 sm:gap-6">
            <button
              onClick={() => setActiveTab("menu")}
              className={`pb-4 px-3 sm:px-6 text-sm sm:text-base font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "menu"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Pizza className="w-4 h-4" />
              <span>Full Menu</span>
            </button>
            <button
              id="customizer-tab"
              onClick={() => setActiveTab("configurator")}
              className={`pb-4 px-3 sm:px-6 text-sm sm:text-base font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "configurator"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-amber" />
              <span>Pizza Configurator</span>
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`pb-4 px-3 sm:px-6 text-sm sm:text-base font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "reservations"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Table Booking ({reservations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 px-3 sm:px-6 text-sm sm:text-base font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "reviews"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reviews ({reviews.length})</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT: 1. FULL MENU */}
        {activeTab === "menu" && (
          <section id="menu" className="space-y-8">
            
            {/* Filter and Search controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/80">
              {/* Category buttons */}
              <div className="flex flex-wrap gap-2">
                {["all", "specialty", "classic", "sides", "drinks"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMenuFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      menuFilter === cat
                        ? "bg-brand-red text-white shadow-md shadow-brand-red/20"
                        : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search popular items..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-amber/40 bg-neutral-50/50 text-neutral-900 font-medium"
                />
                <span className="absolute right-3.5 top-3.5 text-neutral-400">🔍</span>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => {
                const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large">("medium");

                return (
                  <div
                    key={item.id}
                    id={`menu-item-${item.id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-md border border-neutral-200/60 hover:shadow-xl hover:border-brand-amber/40 transition-all flex flex-col group"
                  >
                    {/* Item Image with badging */}
                    <div className="h-48 relative overflow-hidden bg-neutral-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {item.isPopular && (
                        <span className="absolute top-3 left-3 bg-brand-amber text-neutral-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md">
                          ★ Most Ordered
                        </span>
                      )}
                      <span className="absolute bottom-3 right-3 bg-brand-dark/80 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                        Rs. {item.prices[selectedSize]}
                      </span>
                    </div>

                    {/* Description & info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-serif font-extrabold text-neutral-900 group-hover:text-brand-red transition-colors">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Size selector buttons */}
                        <div className="flex bg-neutral-100 p-1 rounded-xl gap-1">
                          {(["small", "medium", "large"] as const).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setSelectedSize(sz)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                selectedSize === sz
                                  ? "bg-white text-neutral-900 shadow-sm"
                                  : "text-neutral-500 hover:text-neutral-800"
                              }`}
                            >
                              {sz[0]} <span className="hidden sm:inline">{sz.slice(1)}</span>
                            </button>
                          ))}
                        </div>

                        {/* Order action */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => addToCart(item, selectedSize)}
                            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-brand-amber" />
                            Add Rs.{item.prices[selectedSize]}
                          </button>
                          
                          {item.category === "specialty" && (
                            <button
                              onClick={() => {
                                setConfigPizza({
                                  name: item.name,
                                  size: selectedSize,
                                  crust: "Pan",
                                  cheeseLevel: "Normal",
                                  toppings: item.id === "malai-boti" ? ["Malai Chicken Boti"] : ["Seekh Kabab Chunks"]
                                });
                                setActiveTab("configurator");
                                triggerNotification("Loaded specialty recipe into custom builder!");
                              }}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2.5 rounded-xl border border-neutral-200 transition-colors"
                              title="Customize Recipe"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200">
                <p className="text-neutral-400 text-3xl">🍕</p>
                <h4 className="text-lg font-bold text-neutral-700 mt-2">No menu items found</h4>
                <p className="text-xs text-neutral-500">Try checking spelling or choosing another category category.</p>
              </div>
            )}

          </section>
        )}

        {/* TAB CONTENT: 2. ARTISANAL PIZZA CONFIGURATOR */}
        {activeTab === "configurator" && (
          <section id="customizer" className="bg-white rounded-3xl shadow-lg border border-neutral-200 p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Configurator Options */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="bg-brand-amber/15 text-brand-amber text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                    Artisanal Sandbox
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-neutral-900 mt-2">
                    Design Your Ideal Cabin Pizza
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Select your perfect size, hand-crafted crust style, cheese density, and stack up fresh ingredients. Watch your pie and price update instantly.
                  </p>
                </div>

                {/* Option 1: Choose size */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-neutral-700 tracking-wider">
                    1. Select Pizza Diameter & Base Price
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["small", "medium", "large"] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setConfigPizza({ ...configPizza, size: sz })}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          configPizza.size === sz
                            ? "bg-neutral-950 border-neutral-950 text-white shadow-md"
                            : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{sz}</p>
                        <p className="text-sm font-extrabold mt-1">Rs. {BASE_PRICES[sz]}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 2: Choose Crust */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-neutral-700 tracking-wider">
                    2. Choose Dough Crust Structure
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Pan", "Thin", "Stuffed Crust"].map((cr) => (
                      <button
                        key={cr}
                        onClick={() => setConfigPizza({ ...configPizza, crust: cr as any })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          configPizza.crust === cr
                            ? "bg-brand-red border-brand-red text-white shadow-sm"
                            : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {cr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 3: Choose Toppings */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-neutral-700 tracking-wider flex justify-between">
                    <span>3. Choose Premium Toppings</span>
                    <span className="text-[10px] text-brand-amber font-extrabold font-mono">
                      {configPizza.toppings.length} SELECTED
                    </span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                    {Object.keys(TOPPING_PRICES).map((topping) => {
                      const isSelected = configPizza.toppings.includes(topping);
                      return (
                        <button
                          key={topping}
                          onClick={() => toggleConfigTopping(topping)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-neutral-100 border-neutral-950 text-neutral-900 shadow-inner"
                              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={isSelected ? "text-brand-red font-extrabold" : "text-neutral-300"}>
                              {isSelected ? "✓" : "+"}
                            </span>
                            {topping}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            +Rs.{TOPPING_PRICES[topping]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Total Block */}
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      ESTIMATED RECIPE PRICE
                    </p>
                    <p className="text-2xl font-serif font-black text-neutral-900 mt-1">
                      Rs. {getCustomPizzaPrice()}
                    </p>
                  </div>
                  <button
                    onClick={addCustomPizzaToCart}
                    className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm shadow-md transition-all active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add Craft To Order
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Pizza Render Preview */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center bg-neutral-50 rounded-3xl p-6 border border-neutral-100 shadow-inner min-h-80 relative overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-1 text-[10px] text-neutral-400 font-bold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-brand-amber animate-pulse"></span>
                  <span>Visual Sandbox Renderer</span>
                </div>

                {/* Main Visual Pizza Plate */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center transition-all duration-300 hover:scale-[1.02]">
                  {/* Outer Plate Shadow */}
                  <div className="absolute inset-0 rounded-full bg-neutral-900/10 blur-xl"></div>
                  
                  {/* Wooden Pizza Board Handle */}
                  <div className="absolute -bottom-10 w-8 h-16 bg-amber-800 rounded-b-xl border border-amber-900/20 shadow-md"></div>

                  {/* Wooden Board circular base */}
                  <div className="absolute inset-[-12px] rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-950 shadow-md flex items-center justify-center">
                    {/* Concentric rings of wood */}
                    <div className="w-[96%] h-[96%] rounded-full border border-amber-800/40"></div>
                  </div>

                  {/* Crust Layer */}
                  <div className="absolute inset-[4px] rounded-full bg-amber-400 border-[8px] border-amber-500 shadow-inner flex items-center justify-center transform transition-transform duration-500">
                    
                    {/* Cheese / Sauce layer base */}
                    <div className="w-[92%] h-[92%] rounded-full bg-gradient-to-br from-yellow-300 to-amber-200 relative overflow-hidden p-2 flex items-center justify-center">
                      
                      {/* Crushed Tomato sauce swirls */}
                      <div className="absolute inset-2 rounded-full border-4 border-dashed border-red-600/30"></div>
                      
                      {/* Cheese melt bubbles */}
                      <div className="absolute w-12 h-12 bg-yellow-400 rounded-full opacity-60 blur-sm top-8 left-12"></div>
                      <div className="absolute w-14 h-14 bg-yellow-400 rounded-full opacity-50 blur-sm bottom-12 right-10"></div>
                      <div className="absolute w-10 h-10 bg-yellow-400 rounded-full opacity-70 blur-md top-20 right-16"></div>

                      {/* Render Toppings layer */}
                      {configPizza.toppings.map((top, idx) => {
                        // Generate dynamic offsets for visual placement
                        const counts = 6;
                        const toppingsRender = [];
                        for (let i = 0; i < counts; i++) {
                          const angle = (i * 2 * Math.PI) / counts + (idx * 0.5);
                          const radius = 30 + (idx * 15) % 55; // layout concentric
                          const leftOffset = 50 + radius * Math.cos(angle);
                          const topOffset = 50 + radius * Math.sin(angle);

                          let toppingSymbol = "🍗";
                          let colorClass = "text-xl";
                          if (top === "Seekh Kabab Chunks") toppingSymbol = "🍖";
                          if (top === "Smoked Pepperoni") toppingSymbol = "🔴";
                          if (top === "Double Cheese") toppingSymbol = "🧀";
                          if (top === "Sweet Bell Peppers") toppingSymbol = "🫑";
                          if (top === "Mushrooms") toppingSymbol = "🍄";
                          if (top === "Jalapenos") toppingSymbol = "🌶️";
                          if (top === "Red Onions") toppingSymbol = "🧅";
                          if (top === "Olives") toppingSymbol = "🫒";
                          if (top === "Sweet Corn") toppingSymbol = "🟡";

                          toppingsRender.push(
                            <span
                              key={`${top}-${i}`}
                              style={{
                                absolute: "true",
                                position: "absolute",
                                left: `${leftOffset}%`,
                                top: `${topOffset}%`,
                                transform: `translate(-50%, -50%) rotate(${i * 45}deg)`
                              }}
                              className={`${colorClass} select-none drop-shadow-md z-20 animate-fadeIn`}
                            >
                              {toppingSymbol}
                            </span>
                          );
                        }
                        return toppingsRender;
                      })}

                      {/* Dynamic Toppings text indicator on visual when empty */}
                      {configPizza.toppings.length === 0 && (
                        <div className="absolute inset-0 bg-yellow-100/70 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4 z-10">
                          <p className="text-xl">🧀</p>
                          <p className="text-xs font-black text-neutral-800">Cheese Pizza Base</p>
                          <p className="text-[10px] text-neutral-500">Toggle toppings to bake them on!</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Interactive visual summary metadata */}
                <div className="mt-14 text-center space-y-1 relative z-20">
                  <h4 className="text-sm font-black text-neutral-900 capitalize">
                    {configPizza.size} {configPizza.crust} Pizza
                  </h4>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                    {configPizza.cheeseLevel} Cheese Density
                  </p>
                  <p className="text-xs text-brand-red font-extrabold">
                    {configPizza.toppings.length === 0 
                      ? "Pure Cheese Base" 
                      : `Topped with: ${configPizza.toppings.join(", ")}`}
                  </p>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* TAB CONTENT: 3. TABLE BOOKING & RESERVATION ORGANIZER */}
        {activeTab === "reservations" && (
          <section id="reservation" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Form Panel */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-neutral-200">
                <div className="space-y-2 mb-6">
                  <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Table Reservations
                  </span>
                  <h3 className="text-2xl font-serif font-extrabold text-neutral-900">
                    Book a Family Cabin Table
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Sargodha residents love our cozy dine-in zones. Pre-book your spot to skip the queue queue.
                  </p>
                </div>

                {reservationSuccess ? (
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-200 text-center space-y-4">
                    <span className="text-4xl">🎉</span>
                    <h4 className="text-lg font-bold text-green-800">Reservation Confirmed!</h4>
                    <p className="text-xs text-green-600">
                      Your family cabin table is saved. We have dispatched a reference code. Just show your name at the cabin counter!
                    </p>
                    <button
                      onClick={() => setReservationSuccess(false)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      Book Another Table
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookTable} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. M. Ibrahim"
                        value={newReservation.name}
                        onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl text-sm border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 03001234567"
                        value={newReservation.phone}
                        onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl text-sm border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Date</label>
                        <input
                          type="date"
                          required
                          value={newReservation.date}
                          onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-xs border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Time Slot</label>
                        <select
                          value={newReservation.time}
                          onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-xs border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-bold bg-white"
                        >
                          <option value="12:00">12:00 PM</option>
                          <option value="14:00">02:00 PM</option>
                          <option value="16:00">04:00 PM</option>
                          <option value="18:00">06:00 PM</option>
                          <option value="19:00">07:00 PM</option>
                          <option value="20:00">08:00 PM</option>
                          <option value="21:00">09:00 PM</option>
                          <option value="22:00">10:00 PM</option>
                          <option value="00:00">12:00 AM Midnight</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Guests count</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          required
                          value={newReservation.guests}
                          onChange={(e) => setNewReservation({ ...newReservation, guests: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Seating Section</label>
                        <select
                          value={newReservation.section}
                          onChange={(e) => setNewReservation({ ...newReservation, section: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-xs border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-bold bg-white"
                        >
                          <option value="Family Lounge">Family Lounge</option>
                          <option value="Main Cabin Area">Main Cabin Area</option>
                          <option value="VIP Private Cabin">VIP Private Cabin (+Rs.500)</option>
                          <option value="Roof terrace">Roof terrace section</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-brand-amber" /> Confirm Cabin Reservation
                    </button>
                  </form>
                )}
              </div>

              {/* Right List Panel */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-neutral-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-lg font-serif font-extrabold text-neutral-900 flex items-center justify-between">
                    <span>Active Reservations Status</span>
                    <span className="text-xs font-mono font-bold bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-lg">
                      {reservations.length} BOOKED
                    </span>
                  </h4>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                    {reservations.map((res) => (
                      <div
                        key={res.id}
                        className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900 capitalize">{res.name}</span>
                            <span className="text-[9px] font-mono font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              {res.section}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 font-medium">
                            📆 {res.date} at {res.time} • 👥 {res.guests} Guests
                          </p>
                          <p className="text-[9px] font-mono text-neutral-400">ID: {res.id} • 📞 {res.phone}</p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                            {res.status}
                          </span>
                          <button
                            onClick={() => cancelReservation(res.id)}
                            className="text-neutral-400 hover:text-brand-red p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="Cancel Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {reservations.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-neutral-300 text-2xl">📅</p>
                        <p className="text-xs text-neutral-500 font-bold mt-1">No reservations listed</p>
                        <p className="text-[10px] text-neutral-400">Book your table on the left side panel!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aesthetic Family Environment Highlight */}
                <div className="bg-neutral-50/50 p-4 rounded-2xl border border-dashed border-neutral-300 mt-6 flex items-center gap-3.5">
                  <div className="bg-brand-amber/10 text-brand-amber p-2.5 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800">Warm Family Environment Guaranteed</h5>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                      Our facility offers separate cabins for family comfort, clean kids seating zone, and full air conditioning in warm Sargodha weather.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* TAB CONTENT: 4. CUSTOMER REVIEWS & FEEDBACK */}
        {activeTab === "reviews" && (
          <section id="reviews-section" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Review Statistics Block */}
              <div className="lg:col-span-4 bg-brand-dark text-white p-6 sm:p-8 rounded-3xl shadow-md border border-neutral-800 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="bg-brand-amber/20 text-brand-amber text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Sargodha Community
                  </span>
                  <h3 className="text-3xl font-serif font-extrabold tracking-tight">
                    What They Say About Our Taste
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    We take immense pride in our local reputation. Freshness and friendly service are our ultimate priorities.
                  </p>

                  {/* Rating Badge */}
                  <div className="bg-neutral-800/80 p-5 rounded-2xl border border-neutral-700 flex items-center justify-between">
                    <div>
                      <p className="text-3xl sm:text-4xl font-serif font-black text-brand-amber">{averageRating}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">OUT OF 5 STARS</p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5 text-brand-amber">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-brand-amber text-brand-amber" />
                        ))}
                      </div>
                      <p className="text-[10px] text-neutral-300 font-extrabold mt-1.5">{reviews.length} total local responses</p>
                    </div>
                  </div>
                </div>

                {/* Quick highlights checklist */}
                <div className="space-y-2 pt-6 border-t border-neutral-800/80">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Top Mentions</p>
                  <ul className="text-xs space-y-1.5 text-neutral-300">
                    <li className="flex items-center gap-1.5">✅ Standout Malai Boti Pizza taste</li>
                    <li className="flex items-center gap-1.5">✅ Extremely friendly and welcoming staff</li>
                    <li className="flex items-center gap-1.5">✅ Affordable, budget-friendly prices</li>
                    <li className="flex items-center gap-1.5">✅ Clean and spacious family zone</li>
                  </ul>
                </div>
              </div>

              {/* Submit Review & Feed lists */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-neutral-200 space-y-8">
                
                {/* Form to submit review */}
                <form onSubmit={handleSubmitReview} className="space-y-4 pb-6 border-b border-neutral-200">
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wide">
                    Share Your Experience Live
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Malik Ahmad"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl text-sm border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase block">Star Rating</label>
                      <div className="flex gap-2 pt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newReview.rating
                                  ? "fill-brand-amber text-brand-amber"
                                  : "text-neutral-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Write Review</label>
                    <textarea
                      required
                      placeholder="Share your thoughts on the pizza taste, delivery speed, or staff environment..."
                      rows={3}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl text-xs border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Feed Response
                  </button>
                </form>

                {/* Reviews Feed list */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                    Feedback Timeline
                  </h4>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 space-y-2 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-neutral-900">{rev.name}</span>
                            {rev.isGoogleReview && (
                              <span className="text-[8px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                G Google Verified
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-neutral-400 font-mono">{rev.date}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5 text-brand-amber">
                          {Array.from({ length: rev.rating }).map((_, starIdx) => (
                            <Star key={starIdx} className="w-3.5 h-3.5 fill-brand-amber text-brand-amber" />
                          ))}
                        </div>

                        <p className="text-xs text-neutral-600 font-medium leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

      </main>

      {/* POPULAR GALLERY DISPLAY */}
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-brand-amber text-xs font-black uppercase tracking-widest">
              Cabin Kitchen Gallery
            </span>
            <h3 className="text-3xl font-serif font-extrabold tracking-tight">
              Freshly Baked For Our Family Customers
            </h3>
            <p className="text-xs text-neutral-400 font-medium">
              Take a sneak peek inside our brick oven dough prep, loaded cheese toppings, and high quality fresh ingredients cooked on extreme clay heat.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-60 rounded-2xl overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"
                alt="Clay Oven Fresh Prep"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Tossed Fresh Daily</span>
              </div>
            </div>
            <div className="h-60 rounded-2xl overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80"
                alt="Classic Margherita melted"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Premium Mozzarella</span>
              </div>
            </div>
            <div className="h-60 rounded-2xl overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=400&q=80"
                alt="Kabab Feast Spiced"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Artisanal Seekh Kabab</span>
              </div>
            </div>
            <div className="h-60 rounded-2xl overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80"
                alt="Wings Side glaze"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Smoked Appetizers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURE MAPS, REAL LOCATION, & DETAILED CONTACT */}
      <section id="location" className="bg-white py-16 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Left Info Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="bg-brand-red/10 text-brand-red text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Come Visit Us
                </span>
                <h3 className="text-3xl font-serif font-extrabold text-neutral-900 tracking-tight">
                  Pizza Cabin Location & Contact
                </h3>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Located directly opposite the scenic Gulzar-e-Madina Masjid, 49 Tail, Siraj Colony in beautiful Sargodha, Pakistan. Drop by with your family or call us for lightning-fast home delivery!
                </p>
              </div>

              {/* Detailed Location Address Cards */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="bg-brand-amber text-neutral-900 p-2.5 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-neutral-900">Restaurant Address</h5>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Gulzar-e-Madina Masjid, 49 Tail, Siraj Colony, Sargodha, Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="bg-brand-amber text-neutral-900 p-2.5 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-neutral-900">Direct Hotline & Support</h5>
                    <p className="text-xs text-neutral-600 mt-0.5 font-bold">
                      +92 48 1234567 • +92 300 7654321
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Call anytime to track bulk wedding/party orders.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="bg-brand-amber text-neutral-900 p-2.5 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-neutral-900">Operating Timeline</h5>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Open 24 Hours • 7 Days a Week
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Late-night delivery dispatcher active all night.</p>
                  </div>
                </div>
              </div>

              {/* Quick interactive share action */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Pizza Cabin Sargodha',
                      text: 'Order the famous Malai Boti Pizza from Pizza Cabin Sargodha!',
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    triggerNotification("Link copied! Share it with friends and family.");
                  }
                }}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md w-full"
              >
                <span>Share Website With Friends & Family</span>
                <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px]">🔗</span>
              </button>
            </div>

            {/* Right Map Column (Embedded Google Maps with requested Iframe) */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border-2 border-neutral-200 shadow-md h-[400px] lg:h-auto min-h-80 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d422.80301578271286!2d72.6968383039647!3d32.03070954674221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3921793e70bd046d%3A0x702f7c0fee9513a!2sPizza%20Cabin!5e0!3m2!1sen!2s!4v1783298886046!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* OVERLAY: CART DRAWER & CHECKOUT SLIDE-OVER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Dark glass backdrop overlay */}
            <div
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity"
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl border-l border-neutral-200 flex flex-col h-full animate-slideOver">
                
                {/* Header block */}
                <div className="p-6 bg-neutral-950 text-white flex items-center justify-between">
                  <h3 className="text-lg font-serif font-extrabold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-brand-amber" />
                    <span>Your Order Cart</span>
                  </h3>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Main Content Area (Multi step checkouts) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Step Indicators */}
                  <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-400 pb-3 border-b border-neutral-100">
                    <span className={checkoutStep === "cart" ? "text-brand-red underline underline-offset-4" : "text-neutral-500"}>1. Review</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className={checkoutStep === "details" ? "text-brand-red underline underline-offset-4" : "text-neutral-500"}>2. Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className={checkoutStep === "success" ? "text-brand-red underline underline-offset-4" : "text-neutral-500"}>3. Track</span>
                  </div>

                  {/* STEP 1: CART REVIEWS */}
                  {checkoutStep === "cart" && (
                    <div className="space-y-4">
                      {cart.length === 0 ? (
                        <div className="text-center py-20 space-y-3">
                          <p className="text-4xl">🍕</p>
                          <h4 className="text-sm font-bold text-neutral-700">Your cart is currently empty</h4>
                          <p className="text-[11px] text-neutral-400">Add delicious baked items from our menu catalog to start ordering!</p>
                          <button
                            onClick={() => {
                              setIsCartOpen(false);
                              setActiveTab("menu");
                            }}
                            className="bg-brand-red text-white text-xs font-extrabold px-4 py-2 rounded-xl"
                          >
                            Browse Menu Now
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cart.map((item) => (
                            <div
                              key={item.cartId}
                              className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3.5"
                            >
                              <div className="space-y-1">
                                <h5 className="text-xs font-extrabold text-neutral-900 capitalize">{item.name}</h5>
                                <p className="text-[9px] text-neutral-400 uppercase tracking-wider">
                                  {item.size} • {item.crust}
                                </p>
                                {item.extraToppings.length > 0 && (
                                  <p className="text-[9px] text-brand-amber font-semibold">
                                    + {item.extraToppings.join(", ")}
                                  </p>
                                )}
                                <p className="text-xs font-bold text-neutral-800">Rs. {item.price * item.quantity}</p>
                              </div>

                              <div className="flex items-center gap-2.5">
                                <div className="flex items-center bg-neutral-200 rounded-lg p-0.5">
                                  <button
                                    onClick={() => updateCartQty(item.cartId, -1)}
                                    className="p-1 text-neutral-600 hover:text-neutral-900"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-extrabold w-6 text-center text-neutral-900">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQty(item.cartId, 1)}
                                    className="p-1 text-neutral-600 hover:text-neutral-900"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeCartItem(item.cartId)}
                                  className="text-neutral-400 hover:text-brand-red"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2: DETAILS INPUT */}
                  {checkoutStep === "details" && (
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      
                      <div className="grid grid-cols-2 gap-2.5 bg-neutral-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setCheckoutDetails({ ...checkoutDetails, deliveryType: "delivery" })}
                          className={`py-2 rounded-lg text-xs font-bold ${
                            checkoutDetails.deliveryType === "delivery"
                              ? "bg-white text-neutral-900 shadow-sm"
                              : "text-neutral-500 hover:text-neutral-800"
                          }`}
                        >
                          🚗 Dispatch Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutDetails({ ...checkoutDetails, deliveryType: "takeout" })}
                          className={`py-2 rounded-lg text-xs font-bold ${
                            checkoutDetails.deliveryType === "takeout"
                              ? "bg-white text-neutral-900 shadow-sm"
                              : "text-neutral-500 hover:text-neutral-800"
                          }`}
                        >
                          🛍️ Self Takeout
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Your Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Zain Ali"
                          value={checkoutDetails.name}
                          onChange={(e) => setCheckoutDetails({ ...checkoutDetails, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl text-xs border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">WhatsApp / Mobile Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 03007654321"
                          value={checkoutDetails.phone}
                          onChange={(e) => setCheckoutDetails({ ...checkoutDetails, phone: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl text-xs border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                        />
                      </div>

                      {checkoutDetails.deliveryType === "delivery" && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase">Sargodha Delivery Address</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Please write detailed home street, colony, or nearest landmark (e.g. Siraj Colony, near Madina Masjid)"
                            value={checkoutDetails.address}
                            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, address: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl text-xs border border-neutral-300 focus:ring-2 focus:ring-brand-amber/40 text-neutral-900 font-medium"
                          ></textarea>
                          <p className="text-[9px] text-neutral-400">Note: local delivery fee is flat Rs.150 for our zones.</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Choose Payment Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "cod", title: "Cash On Delivery" },
                            { id: "easypaisa", title: "EasyPaisa" },
                            { id: "bank", title: "Bank Trans." }
                          ].map((pay) => (
                            <button
                              key={pay.id}
                              type="button"
                              onClick={() => setCheckoutDetails({ ...checkoutDetails, paymentMethod: pay.id as any })}
                              className={`p-2 border rounded-xl text-center text-[10px] font-bold transition-all ${
                                checkoutDetails.paymentMethod === pay.id
                                  ? "bg-neutral-900 border-neutral-900 text-white"
                                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                              }`}
                            >
                              {pay.title}
                            </button>
                          ))}
                        </div>
                        {checkoutDetails.paymentMethod !== "cod" && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 leading-relaxed">
                            <strong>Interactive Mode Notice:</strong> Kindly complete transfer to <strong>0300-1234567</strong> (EasyPaisa/Bank account) and our manager will verify before dispatch.
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-brand-red/20 transition-all active:scale-95"
                      >
                        Confirm Order (Rs. {calculateTotal()})
                      </button>
                    </form>
                  )}

                  {/* STEP 3: TRACK SUCCESS RECEIPT */}
                  {checkoutStep === "success" && placedOrder && (
                    <div className="space-y-6">
                      
                      {/* Ticket slip */}
                      <div className="border border-dashed border-neutral-300 p-5 rounded-2xl bg-neutral-50 space-y-4">
                        <div className="text-center">
                          <span className="text-3xl">🎉</span>
                          <h4 className="text-base font-serif font-bold text-neutral-900 mt-1">Order Dispatching Live</h4>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase">ID: {placedOrder.orderId}</p>
                        </div>

                        <div className="border-t border-neutral-200 pt-3 text-xs space-y-1.5 font-medium">
                          <div className="flex justify-between text-neutral-500">
                            <span>Placed at:</span>
                            <span className="text-neutral-800 font-bold">{placedOrder.time}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Delivery Mode:</span>
                            <span className="text-neutral-800 font-bold uppercase">{checkoutDetails.deliveryType}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Phone:</span>
                            <span className="text-neutral-800 font-bold">{checkoutDetails.phone}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Total Charged:</span>
                            <span className="text-neutral-900 font-extrabold font-mono text-xs">Rs. {placedOrder.total}</span>
                          </div>
                        </div>

                        {/* Interactive tracker timeline */}
                        <div className="pt-3 border-t border-neutral-200 space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 text-center">Simulated Kitchen Progress Tracker</p>
                          
                          <div className="relative">
                            {/* Line spacer */}
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-neutral-200"></div>

                            {[
                              { label: "Order Ticket Placed", desc: "Your baked pizza request is locked in.", step: 0 },
                              { label: "Baking inside Wood/Clay Oven", desc: "Adding fresh mozzarella & baking on hot clay.", step: 1 },
                              { label: "Out for Quick Delivery", desc: "On way from Siraj Colony to your home address.", step: 2 },
                              { label: "Delivered Warm & Fresh", desc: "Enjoy authentic Pizza Cabin taste! Rate us.", step: 3 }
                            ].map((stage) => {
                              const isActive = placedOrder.status >= stage.step;
                              const isCurrent = placedOrder.status === stage.step;

                              return (
                                <div key={stage.step} className="relative flex gap-4 items-start pb-4 last:pb-0">
                                  <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-extrabold relative z-10 transition-colors ${
                                    isActive 
                                      ? "bg-brand-red text-white ring-4 ring-brand-red/15" 
                                      : "bg-neutral-200 text-neutral-400"
                                  }`}>
                                    {stage.step + 1}
                                  </div>
                                  <div className="space-y-0.5">
                                    <h5 className={`text-xs font-bold ${
                                      isCurrent ? "text-brand-red" : isActive ? "text-neutral-900" : "text-neutral-400"
                                    }`}>
                                      {stage.label} {isCurrent && <span className="animate-pulse text-[9px] bg-red-100 text-brand-red px-1 rounded ml-1">ACTIVE</span>}
                                    </h5>
                                    <p className="text-[10px] text-neutral-500 font-medium">{stage.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutStep("cart");
                          setIsCartOpen(false);
                        }}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                      >
                        Back to Browsing Site
                      </button>

                    </div>
                  )}

                </div>

                {/* Footer totals block if in Step 1 or Step 2 */}
                {checkoutStep !== "success" && cart.length > 0 && (
                  <div className="p-6 bg-neutral-50 border-t border-neutral-200 space-y-4">
                    <div className="space-y-1.5 text-xs text-neutral-500 font-medium">
                      <div className="flex justify-between">
                        <span>Subtotal Price</span>
                        <span className="text-neutral-800">Rs. {calculateSubtotal()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Punjab Provincial Sales Tax (5%)</span>
                        <span className="text-neutral-800">Rs. {Math.round(calculateSubtotal() * 0.05)}</span>
                      </div>
                      {checkoutDetails.deliveryType === "delivery" && (
                        <div className="flex justify-between">
                          <span>Local Delivery Fee</span>
                          <span className="text-neutral-800">Rs. 150</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-neutral-900 font-extrabold pt-2 border-t border-neutral-200">
                        <span>Grand Total</span>
                        <span className="text-brand-red font-mono">Rs. {calculateTotal()}</span>
                      </div>
                    </div>

                    {checkoutStep === "cart" && (
                      <button
                        onClick={() => setCheckoutStep("details")}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-neutral-900/10 transition-transform active:scale-95"
                      >
                        Proceed to Checkout Details
                        <ChevronRight className="w-4 h-4 text-brand-amber" />
                      </button>
                    )}

                    {checkoutStep === "details" && (
                      <button
                        onClick={() => setCheckoutStep("cart")}
                        className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                      >
                        Review Ordered Items
                      </button>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-brand-dark text-white pt-12 pb-6 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-brand-red p-2 rounded-lg">
                  <Pizza className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-serif font-extrabold">Pizza Cabin</h4>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                Sargodha's premier clay-oven pizza house. Fusing traditional local marination techniques with soft Italian sourdough recipes.
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase text-brand-amber tracking-widest">Our Bestsellers</h5>
              <ul className="text-xs text-neutral-400 space-y-1.5 font-medium">
                <li><a href="#menu" className="hover:text-white">Creamy Malai Boti Pizza</a></li>
                <li><a href="#menu" className="hover:text-white">Sargodha Seekh Kabab Pizza</a></li>
                <li><a href="#menu" className="hover:text-white">Artisanal Margherita Pizza</a></li>
                <li><a href="#menu" className="hover:text-white">Cabin Special Deluxe Loaded</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase text-brand-amber tracking-widest">Quick Navigation</h5>
              <ul className="text-xs text-neutral-400 space-y-1.5 font-medium">
                <li><a href="#menu" className="hover:text-white">Explore Full Food Menu</a></li>
                <li><a href="#customizer" className="hover:text-white">Interactive Pizza Builder</a></li>
                <li><a href="#reservation" className="hover:text-white">Pre-Book Dining Table</a></li>
                <li><a href="#reviews-section" className="hover:text-white">Google Customer Reviews</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase text-brand-amber tracking-widest">Open 24 Hours</h5>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                Enjoy fresh, hot baked pizza any time of day or night. Our delivery riders are dispatched 24/7.
              </p>
              <p className="text-xs font-extrabold text-white">Call: +92 300 7654321</p>
            </div>

          </div>

          <div className="pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>Pizza Cabin Sargodha © {new Date().getFullYear()}. All Rights Reserved.</p>
            <p className="flex items-center gap-1.5">
              <span>Made with premium quality ingredients</span>
              <span className="text-brand-red text-sm">❤️</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
