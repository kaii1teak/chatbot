document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages")
  const userInput = document.getElementById("user-input")
  const sendButton = document.getElementById("send-button")
  const clearChatButton = document.getElementById("clear-chat")
  const optionsContainer = document.getElementById("options-container")
  const bookingSummary = document.getElementById("booking-summary")

  const flightOptionsTemplate = document.getElementById("flight-options-template")
  const roomOptionsTemplate = document.getElementById("room-options-template")
  const flightOptionTemplate = document.getElementById("flight-option-template")
  const roomOptionTemplate = document.getElementById("room-option-template")
  const datePickerTemplate = document.getElementById("date-picker-template")
  const paymentTemplate = document.getElementById("payment-template")
  const citySelectionTemplate = document.getElementById("city-selection-template")

  document.getElementById("theme-button").addEventListener("click", () => {
    const link = document.getElementById("theme-link")
    const svgImage = document.getElementById("theme-icon") // Assuming you're using an <img> tag with id="theme-icon"

    // Toggle stylesheets
    if (link.href.endsWith("styles.css")) {
      link.href = "dark_theme.css" // Switch to dark theme
      svgImage.src = "/dark.svg" // Change to dark theme icon
    } else {
      link.href = "styles.css" // Switch to light theme
      svgImage.src = "/white.svg" // Change to light theme icon
    }
  })

  let cities = []

  fetch("cities_countries.json")
    .then((response) => response.json())
    .then((data) => {
      cities = data
      console.log("Cities loaded:", cities)
    })
    .catch((error) => {
      console.error("City loading error:", error)
    })

  // Chat state
  let chatState = {
    flightBooked: false,
    waitingForFlightBookingAnswer: false,
    waitingForDepartureCity: false,
    waitingForDates: false,
    selectedFlight: null,
    selectedRoom: null,
    departureCity: "",
    checkInDate: null,
    checkOutDate: null,
    currentStep: "greeting",
    conversationHistory: [],
  }

  // Sample data for flights and rooms
  const flights = [
    {
      id: "f1",
      airline: "Iberia",
      flightNumber: "IB3456",
      origin: "", // Will be set dynamically
      destination: "Tenerife (TFS)",
      departureTime: "10:15",
      arrivalTime: "14:45",
      duration: "4h 30m",
      date: "May 15, 2025",
      price: "€249",
    },
    {
      id: "f2",
      airline: "Ryanair",
      flightNumber: "FR1234",
      origin: "", // Will be set dynamically
      destination: "Tenerife (TFS)",
      departureTime: "07:30",
      arrivalTime: "12:00",
      duration: "4h 30m",
      date: "May 15, 2025",
      price: "€189",
    },
    {
      id: "f3",
      airline: "British Airways",
      flightNumber: "BA5678",
      origin: "", // Will be set dynamically
      destination: "Tenerife (TFS)",
      departureTime: "14:20",
      arrivalTime: "18:50",
      duration: "4h 30m",
      date: "May 15, 2025",
      price: "€299",
    },
  ]

  const rooms = [
    {
      id: "r1",
      name: "Deluxe Room Ocean",
      image: "https://dam.melia.com/melia/file/9XzJqgSCEgfLbVXCmu7k.jpg",
      price: "€350/night",
      capacity: "2 Adults",
      bedType: "King Bed",
      size: "42m²",
      description: "Elegant room with stunning ocean views, private balcony, and luxury amenities.",
    },
    {
      id: "r2",
      name: "Master Suite Garden",
      image: "https://dam.melia.com/melia/file/Fe1jCDnGviMz5kxYMztq.jpg",
      price: "€450/night",
      capacity: "2 Adults, 2 Children",
      bedType: "King Bed + Sofa Bed",
      size: "68m²",
      description: "Spacious suite with separate living area, garden views, and access to exclusive RedLevel services.",
    },
    {
      id: "r3",
      name: "RedLevel Villa",
      image: "https://dam.melia.com/melia/file/DgvEzAU2JaXQAUdGTWXt.jpg",
      price: "€750/night",
      capacity: "4 Adults",
      bedType: "2 King Beds",
      size: "120m²",
      description:
        "Exclusive villa with private pool, garden, and personalized butler service. Premium RedLevel amenities included.",
    },
  ]

  // Template responses
  const templateResponses = {
    greeting:
      "Hello! I'm your Gran Meliá AI Assistant. I'm here to help you book your stay at the luxurious Gran Meliá Palacio de Isora in Tenerife. Have you already booked your flight to Tenerife?",
    askDepartureCity:
      "Which city will you be departing from to fly to Tenerife? I'll help you find the best flight options.",
    askDates:
      "Great! Now let's book your stay at Gran Meliá Palacio de Isora. Please select your check-in and check-out dates using the date picker below.",
    flightSelected:
      "Perfect! I've noted your flight selection. Now, let's book your stay at Gran Meliá Palacio de Isora. When would you like to check in and check out?",
    datesSelected:
      "Excellent! I'll find available rooms at Gran Meliá Palacio de Isora for your selected dates. Here are some options:",
    roomSelected: "Great choice! Would you like to proceed to payment to complete your booking?",
    bookingComplete:
      "Thank you for your booking! Your reservation at Gran Meliá Palacio de Isora is confirmed. You'll receive a confirmation email shortly with all the details. Is there anything else I can help you with regarding your stay?",
    askFlights:
      "I'd be happy to help you find a flight to Tenerife. Could you please tell me which city you'll be departing from?",
    askRooms:
      "Gran Meliá Palacio de Isora offers luxurious rooms and suites with stunning views. To show you available options, I'll need to know your check-in and check-out dates. When are you planning to stay?",
    amenities:
      "Gran Meliá Palacio de Isora offers a wide range of amenities including multiple swimming pools, a spa, fitness center, several restaurants and bars, kids club, and direct access to the beach. The hotel also features the exclusive RedLevel service for premium guests.",
    restaurants:
      "The hotel features several dining options: Club Ocean for Mediterranean cuisine, Pangea for international buffet, Oasis Pool Grille for casual dining, and DUO for fine dining. There's also ABAMA Kabuki for Japanese cuisine and several bars throughout the property.",
    beaches:
      "Gran Meliá Palacio de Isora has an infinity pool that's one of the largest in Europe, plus several other pools including adults-only options. The hotel is located on Alcalá Beach with volcanic black sand, and there are several other beaches nearby.",
    cancellation:
      "For cancellations, the hotel typically requires notice 24-72 hours before arrival depending on your rate. I recommend checking your specific booking terms or contacting the hotel directly for assistance with cancellations.",
    location:
      "Gran Meliá Palacio de Isora is located in Alcalá, on the southwest coast of Tenerife, with stunning views of the Atlantic Ocean and La Gomera island. The address is: Avenida de Los Océanos, s/n, 38686 Alcalá, Santa Cruz de Tenerife, Spain.",
    greeting2:
      "Hello! I'm your Gran Meliá AI Assistant. How can I help you today? Are you interested in booking a flight to Tenerife or a room at our luxurious Gran Meliá Palacio de Isora resort?",
    thanks:
      "You're welcome! It's my pleasure to assist you with your travel plans. Is there anything else you'd like to know about Gran Meliá Palacio de Isora?",
    default:
      "I'm here to help with your booking at Gran Meliá Palacio de Isora. You can ask me about flight options to Tenerife, room availability, hotel amenities, or proceed with your booking. How can I assist you today?",
  }

  // Initialize the chat
  function initChat() {
    console.log("Initializing chat...")

    // Event listeners
    if (sendButton) {
      sendButton.addEventListener("click", handleUserMessage)
      console.log("Send button listener added")
    } else {
      console.error("Send button not found")
    }

    if (userInput) {
      userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          handleUserMessage()
        }
      })
      console.log("User input listener added")
    } else {
      console.error("User input not found")
    }

    if (clearChatButton) {
      clearChatButton.addEventListener("click", clearChat)
      console.log("Clear chat button listener added")
    } else {
      console.error("Clear chat button not found")
    }

    // Send initial greeting
    setTimeout(() => {
      addBotMessage(templateResponses.greeting)
      chatState.waitingForFlightBookingAnswer = true
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.greeting,
      })
    }, 500)
  }

  // Handle user message
  function handleUserMessage() {
    if (!userInput) {
      console.error("User input element not found")
      return
    }

    const message = userInput.value.trim()
    if (message === "") return

    // Add user message to chat
    addUserMessage(message)

    // Add to conversation history
    chatState.conversationHistory.push({
      role: "user",
      content: message,
    })

    // Clear input
    userInput.value = ""

    // Process message based on current state
    processUserMessage(message)
  }

  // Process user message based on current state
  function processUserMessage(message) {
    const lowerMessage = message.toLowerCase()

    if (chatState.waitingForFlightBookingAnswer) {
      chatState.waitingForFlightBookingAnswer = false

      if (lowerMessage.includes("yes")) {
        chatState.flightBooked = true
        chatState.currentStep = "askDates"
        handleHotelBookingFlow()
      } else if (lowerMessage.includes("no")) {
        chatState.flightBooked = false
        chatState.currentStep = "askDepartureCity"
        askForDepartureCity()
      } else {
        addBotMessage("I'm not sure if you've booked a flight yet. Please answer with yes or no.")
        chatState.waitingForFlightBookingAnswer = true
        chatState.conversationHistory.push({
          role: "assistant",
          content: "I'm not sure if you've booked a flight yet. Please answer with yes or no.",
        })
      }
    } else if (chatState.waitingForDepartureCity) {
      chatState.waitingForDepartureCity = false
      chatState.departureCity = message
      chatState.currentStep = "askFlightDetails"

      // Update flight origins with the selected departure city
      flights.forEach((flight) => {
        flight.origin = `${message} (${message.substring(0, 3).toUpperCase()})`
      })

      addBotMessage(
        `Thank you for selecting ${message} as your departure city. Here are available flights to Tenerife:`,
      )
      chatState.conversationHistory.push({
        role: "assistant",
        content: `Thank you for selecting ${message} as your departure city. Here are available flights to Tenerife:`,
      })

      setTimeout(() => {
        showFlightOptions()
      }, 1000)
    } else if (lowerMessage.includes("flight") || lowerMessage.includes("fly")) {
      if (!chatState.departureCity) {
        chatState.currentStep = "askDepartureCity"
        askForDepartureCity()
      } else {
        addBotMessage(`Here are available flights from ${chatState.departureCity} to Tenerife:`)
        chatState.conversationHistory.push({
          role: "assistant",
          content: `Here are available flights from ${chatState.departureCity} to Tenerife:`,
        })

        setTimeout(() => {
          showFlightOptions()
        }, 1000)
      }
    } else if (lowerMessage.includes("hotel") || lowerMessage.includes("room") || lowerMessage.includes("stay")) {
      if (!chatState.checkInDate || !chatState.checkOutDate) {
        chatState.currentStep = "askDates"
        chatState.waitingForDates = true

        addBotMessage(templateResponses.askRooms)
        chatState.conversationHistory.push({
          role: "assistant",
          content: templateResponses.askRooms,
        })

        setTimeout(() => {
          showDatePicker()
        }, 1000)
      } else {
        addBotMessage(
          `Here are available rooms at Gran Meliá Palacio de Isora for your stay from ${chatState.checkInDate.toLocaleDateString()} to ${chatState.checkOutDate.toLocaleDateString()}:`,
        )
        chatState.conversationHistory.push({
          role: "assistant",
          content: `Here are available rooms at Gran Meliá Palacio de Isora for your stay from ${chatState.checkInDate.toLocaleDateString()} to ${chatState.checkOutDate.toLocaleDateString()}:`,
        })

        setTimeout(() => {
          showRoomOptions()
        }, 1000)
      }
    } else if (lowerMessage.includes("city") || lowerMessage.includes("from") || lowerMessage.includes("depart")) {
      chatState.currentStep = "askDepartureCity"
      askForDepartureCity()
    } else if (
      lowerMessage.includes("date") ||
      lowerMessage.includes("when") ||
      lowerMessage.includes("check in") ||
      lowerMessage.includes("check out")
    ) {
      chatState.currentStep = "askDates"
      chatState.waitingForDates = true

      addBotMessage(templateResponses.askDates)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.askDates,
      })

      setTimeout(() => {
        showDatePicker()
      }, 1000)
    } else if (
      lowerMessage.includes("pay") ||
      lowerMessage.includes("book") ||
      lowerMessage.includes("confirm") ||
      lowerMessage.includes("reserve")
    ) {
      if (chatState.selectedRoom) {
        addBotMessage(
          "Great! Let's proceed with your booking. Please complete the payment form to confirm your reservation.",
        )
        chatState.conversationHistory.push({
          role: "assistant",
          content:
            "Great! Let's proceed with your booking. Please complete the payment form to confirm your reservation.",
        })
        showPaymentForm()
      } else {
        addBotMessage(
          "Before we can complete your booking, you'll need to select a room. Would you like to see available rooms at Gran Meliá Palacio de Isora?",
        )
        chatState.conversationHistory.push({
          role: "assistant",
          content:
            "Before we can complete your booking, you'll need to select a room. Would you like to see available rooms at Gran Meliá Palacio de Isora?",
        })
      }
    } else if (lowerMessage.includes("amenities") || lowerMessage.includes("facilities")) {
      addBotMessage(templateResponses.amenities)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.amenities,
      })
    } else if (lowerMessage.includes("restaurant") || lowerMessage.includes("food") || lowerMessage.includes("eat")) {
      addBotMessage(templateResponses.restaurants)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.restaurants,
      })
    } else if (lowerMessage.includes("beach") || lowerMessage.includes("pool")) {
      addBotMessage(templateResponses.beaches)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.beaches,
      })
    } else if (lowerMessage.includes("cancel")) {
      addBotMessage(templateResponses.cancellation)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.cancellation,
      })
    } else if (lowerMessage.includes("location") || lowerMessage.includes("address")) {
      addBotMessage(templateResponses.location)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.location,
      })
    } else if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
      addBotMessage(templateResponses.greeting2)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.greeting2,
      })
    } else if (lowerMessage.includes("thank")) {
      addBotMessage(templateResponses.thanks)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.thanks,
      })
    } else {
      // Default response based on current step
      let response = templateResponses.default

      if (chatState.currentStep === "greeting") {
        response =
          "I'm here to help you book your stay at Gran Meliá Palacio de Isora in Tenerife. Would you like me to help you find a flight to Tenerife, or would you like to see our available rooms?"
      } else if (chatState.currentStep === "askDepartureCity") {
        response = templateResponses.askDepartureCity
      } else if (chatState.currentStep === "askDates") {
        response = templateResponses.askDates
      } else if (chatState.currentStep === "roomSelected" || chatState.currentStep === "flightAndRoomSelected") {
        response =
          "Is there anything specific you'd like to know about your selected room or the hotel facilities? Or would you like to proceed to payment to complete your booking?"
      } else if (chatState.currentStep === "bookingComplete") {
        response =
          "Is there anything else you'd like to know about your upcoming stay at Gran Meliá Palacio de Isora? I can provide information about dining options, activities, or local attractions."
      }

      addBotMessage(response)
      chatState.conversationHistory.push({
        role: "assistant",
        content: response,
      })
    }
  }

  // Ask for departure city
  function askForDepartureCity() {
    addBotMessage(templateResponses.askDepartureCity)
    chatState.waitingForDepartureCity = true
    chatState.conversationHistory.push({
      role: "assistant",
      content: templateResponses.askDepartureCity,
    })

    // Show city selection form
    showCitySelection()
  }

  // Show city selection
  function showCitySelection() {
    if (!citySelectionTemplate || !optionsContainer) {
      console.error("City selection template or options container not found")
      return
    }

    // Clone the template
    const citySelectionContent = citySelectionTemplate.content.cloneNode(true)

    // Clear and show options container
    optionsContainer.innerHTML = ""
    optionsContainer.appendChild(citySelectionContent)
    optionsContainer.classList.add("active")

    // Get DOM elements
    const cityInput = document.getElementById("departure-city")
    const autocompleteDropdown = document.getElementById("city-autocomplete")

    if (!cityInput || !autocompleteDropdown) {
      console.error("City input or autocomplete dropdown not found")
      return
    }

    // Add event listeners for autocomplete
    cityInput.addEventListener("input", function () {
      const inputValue = this.value.trim()

      // Clear the dropdown
      autocompleteDropdown.innerHTML = ""

      if (inputValue.length < 2) {
        autocompleteDropdown.classList.remove("active")
        return
      }

      // Filter cities based on input
      const matchingCities = cities
        .filter((city) => city.city.toLowerCase().startsWith(inputValue.toLowerCase()))
        .slice(0, 10) // Limit to 10 results

      if (matchingCities.length > 0) {
        autocompleteDropdown.classList.add("active")

        // Add matching cities to dropdown
        matchingCities.forEach((city, index) => {
          const item = document.createElement("div")
          item.className = "autocomplete-item"
          if (index === 0) item.classList.add("selected")

          // Highlight the matching part
          const cityName = city.city
          const matchLength = inputValue.length
          const highlightedName = `
            <span class="highlight">${cityName.substring(0, matchLength)}</span>${cityName.substring(matchLength)}
          `

          // Changed code:
          item.innerHTML = `
              <span class="city-name">${highlightedName}</span>
              <span class="country-name">${city.country}</span>
            `

          // Add click event to select city
          item.addEventListener("click", () => {
            cityInput.value = `${city.city}, ${city.country}`
            autocompleteDropdown.classList.remove("active")
          })

          autocompleteDropdown.appendChild(item)
        })
      } else {
        // Show no results message
        autocompleteDropdown.classList.add("active")
        const noResults = document.createElement("div")
        noResults.className = "no-results"
        noResults.textContent = "No matching cities found"
        autocompleteDropdown.appendChild(noResults)
      }
    })

    // Handle keyboard navigation
    cityInput.addEventListener("keydown", (e) => {
      const items = autocompleteDropdown.querySelectorAll(".autocomplete-item")
      const selectedItem = autocompleteDropdown.querySelector(".autocomplete-item.selected")

      if (items.length === 0) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        if (selectedItem) {
          selectedItem.classList.remove("selected")
          const nextItem = selectedItem.nextElementSibling
          if (nextItem && nextItem.classList.contains("autocomplete-item")) {
            nextItem.classList.add("selected")
            nextItem.scrollIntoView({ block: "nearest" })
          } else {
            items[0].classList.add("selected")
            items[0].scrollIntoView({ block: "nearest" })
          }
        } else {
          items[0].classList.add("selected")
          items[0].scrollIntoView({ block: "nearest" })
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        if (selectedItem) {
          selectedItem.classList.remove("selected")
          const prevItem = selectedItem.previousElementSibling
          if (prevItem && prevItem.classList.contains("autocomplete-item")) {
            prevItem.classList.add("selected")
            prevItem.scrollIntoView({ block: "nearest" })
          } else {
            items[items.length - 1].classList.add("selected")
            items[items.length - 1].scrollIntoView({ block: "nearest" })
          }
        } else {
          items[items.length - 1].classList.add("selected")
          items[items.length - 1].scrollIntoView({ block: "nearest" })
        }
      } else if (e.key === "Enter" && autocompleteDropdown.classList.contains("active")) {
        e.preventDefault()
        if (selectedItem) {
          const cityName = selectedItem.querySelector(".city-name").textContent.trim()
          cityInput.value = cityName
          autocompleteDropdown.classList.remove("active")
        }
      } else if (e.key === "Escape") {
        autocompleteDropdown.classList.remove("active")
      }
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!cityInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
        autocompleteDropdown.classList.remove("active")
      }
    })

    // Add event listener to confirm button
    const confirmCityButton = document.getElementById("confirm-city")
    if (confirmCityButton) {
      confirmCityButton.addEventListener("click", () => {
        const city = cityInput.value

        if (city) {
          chatState.departureCity = city
          chatState.waitingForDepartureCity = false

          // Update flight origins with the selected departure city
          flights.forEach((flight) => {
            flight.origin = `${city} (${city.substring(0, 3).toUpperCase()})`
          })

          // Update chat
          addSystemMessage(`You selected ${city} as your departure city.`)

          // Add to conversation history
          chatState.conversationHistory.push({
            role: "system",
            content: `User selected ${city} as their departure city.`,
          })

          // Hide options
          optionsContainer.classList.remove("active")

          // Show flight options
          setTimeout(() => {
            addBotMessage(
              `Thank you for selecting ${city} as your departure city. Here are available flights to Tenerife:`,
            )
            chatState.conversationHistory.push({
              role: "assistant",
              content: `Thank you for selecting ${city} as your departure city. Here are available flights to Tenerife:`,
            })
            showFlightOptions()
          }, 1000)
        } else {
          alert("Please enter a departure city.")
        }
      })
    } else {
      console.error("Confirm city button not found")
    }
  }

  // Handle flight booking flow
  function handleFlightBookingFlow() {
    addBotMessage(templateResponses.askDepartureCity)
    chatState.waitingForDepartureCity = true
    chatState.conversationHistory.push({
      role: "assistant",
      content: templateResponses.askDepartureCity,
    })

    // Show city selection form
    showCitySelection()
  }

  // Handle hotel booking flow
  function handleHotelBookingFlow() {
    addBotMessage(templateResponses.askDates)
    chatState.waitingForDates = true
    chatState.conversationHistory.push({
      role: "assistant",
      content: templateResponses.askDates,
    })

    setTimeout(() => {
      showDatePicker()
    }, 1000)
  }

  // Show flight options
  function showFlightOptions() {
    if (!flightOptionsTemplate || !optionsContainer) {
      console.error("Flight options template or options container not found")
      return
    }

    // Clone the template
    const flightOptionsContent = flightOptionsTemplate.content.cloneNode(true)

    // Clear and show options container
    optionsContainer.innerHTML = ""
    optionsContainer.appendChild(flightOptionsContent)
    optionsContainer.classList.add("active")

    // Get the grid to add flight options
    const flightOptionsGrid = document.getElementById("flight-options-grid")

    if (!flightOptionsGrid) {
      console.error("Flight options grid not found")
      return
    }

    // Add flight options
    flights.forEach((flight) => {
      const flightCard = createFlightCard(flight)
      flightOptionsGrid.appendChild(flightCard)
    })

    // Add event listeners to select buttons
    document.querySelectorAll(".flight-card .select-button").forEach((button) => {
      button.addEventListener("click", () => {
        const flightId = button.getAttribute("data-id")
        selectFlight(flightId)
      })
    })
  }

  // Create a flight card from template
  function createFlightCard(flight) {
    if (!flightOptionTemplate) {
      console.error("Flight option template not found")
      return document.createElement("div")
    }

    const template = flightOptionTemplate.content.cloneNode(true)
    const card = template.querySelector(".flight-card")

    // Replace template variables with actual data
    const html = card.outerHTML
      .replace("{{airline}}", flight.airline)
      .replace("{{price}}", flight.price)
      .replace("{{departureTime}}", flight.departureTime)
      .replace("{{origin}}", flight.origin)
      .replace("{{arrivalTime}}", flight.arrivalTime)
      .replace("{{destination}}", flight.destination)
      .replace("{{duration}}", flight.duration)
      .replace("{{flightNumber}}", flight.flightNumber)
      .replace("{{date}}", flight.date)
      .replace("{{id}}", flight.id)

    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.firstElementChild
  }

  // Select a flight
  function selectFlight(flightId) {
    const flight = flights.find((f) => f.id === flightId)
    chatState.selectedFlight = flight

    // Update chat
    addSystemMessage(
      `You selected flight ${flight.flightNumber} from ${flight.origin} to ${flight.destination} on ${flight.date}.`,
    )

    // Add to conversation history
    chatState.conversationHistory.push({
      role: "system",
      content: `User selected flight ${flight.flightNumber} from ${flight.origin} to ${flight.destination} on ${flight.date}.`,
    })

    // Update booking summary
    updateBookingSummary()

    // Hide options
    optionsContainer.classList.remove("active")

    // Move to next step
    setTimeout(() => {
      addBotMessage(templateResponses.flightSelected)
      chatState.currentStep = "askDates"
      chatState.waitingForDates = true
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.flightSelected,
      })
      showDatePicker()
    }, 1000)
  }

  // Show date picker
  function showDatePicker() {
    if (!datePickerTemplate || !optionsContainer) {
      console.error("Date picker template or options container not found")
      return
    }

    // Clone the template
    const datePickerContent = datePickerTemplate.content.cloneNode(true)

    // Clear and show options container
    optionsContainer.innerHTML = ""
    optionsContainer.appendChild(datePickerContent)
    optionsContainer.classList.add("active")

    // Set min dates to today
    const today = new Date().toISOString().split("T")[0]
    const checkInInput = document.getElementById("check-in")
    const checkOutInput = document.getElementById("check-out")

    if (checkInInput) checkInInput.min = today
    if (checkOutInput) checkOutInput.min = today

    // Add event listener to confirm button
    const confirmDatesButton = document.getElementById("confirm-dates")
    if (confirmDatesButton) {
      confirmDatesButton.addEventListener("click", () => {
        const checkIn = checkInInput.value
        const checkOut = checkOutInput.value

        if (checkIn && checkOut) {
          chatState.checkInDate = new Date(checkIn)
          chatState.checkOutDate = new Date(checkOut)
          chatState.waitingForDates = false

          // Update chat
          addSystemMessage(
            `You selected dates: Check-in on ${chatState.checkInDate.toLocaleDateString()} and Check-out on ${chatState.checkOutDate.toLocaleDateString()}.`,
          )

          // Add to conversation history
          chatState.conversationHistory.push({
            role: "system",
            content: `User selected dates: Check-in on ${chatState.checkInDate.toLocaleDateString()} and Check-out on ${chatState.checkOutDate.toLocaleDateString()}.`,
          })

          // Hide options
          optionsContainer.classList.remove("active")

          // Show room options
          setTimeout(() => {
            addBotMessage(templateResponses.datesSelected)
            chatState.conversationHistory.push({
              role: "assistant",
              content: templateResponses.datesSelected,
            })
            showRoomOptions()
          }, 1000)
        } else {
          alert("Please select both check-in and check-out dates.")
        }
      })
    } else {
      console.error("Confirm dates button not found")
    }
  }

  // Show room options
  function showRoomOptions() {
    if (!roomOptionsTemplate || !optionsContainer) {
      console.error("Room options template or options container not found")
      return
    }

    // Clone the template
    const roomOptionsContent = roomOptionsTemplate.content.cloneNode(true)

    // Clear and show options container
    optionsContainer.innerHTML = ""
    optionsContainer.appendChild(roomOptionsContent)
    optionsContainer.classList.add("active")

    // Get the grid to add room options
    const roomOptionsGrid = document.getElementById("room-options-grid")

    if (!roomOptionsGrid) {
      console.error("Room options grid not found")
      return
    }

    // Add room options
    rooms.forEach((room) => {
      const roomCard = createRoomCard(room)
      roomOptionsGrid.appendChild(roomCard)
    })

    // Add event listeners to select buttons
    document.querySelectorAll(".room-card .select-button").forEach((button) => {
      button.addEventListener("click", () => {
        const roomId = button.getAttribute("data-id")
        selectRoom(roomId)
      })
    })
  }

  // Create a room card from template
  function createRoomCard(room) {
    if (!roomOptionTemplate) {
      console.error("Room option template not found")
      return document.createElement("div")
    }

    const template = roomOptionTemplate.content.cloneNode(true)
    const card = template.querySelector(".room-card")

    // Replace template variables with actual data
    const html = card.outerHTML
      .replace("{{image}}", room.image)
      .replace("{{images}}", room.name)
      .replace("{{names}}", room.name)
      .replace("{{price}}", room.price)
      .replace("{{capacity}}", room.capacity)
      .replace("{{bedType}}", room.bedType)
      .replace("{{size}}", room.size)
      .replace("{{description}}", room.description)
      .replace("{{id}}", room.id)

    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.firstElementChild
  }

  // Select a room
  function selectRoom(roomId) {
    const room = rooms.find((r) => r.id === roomId)
    chatState.selectedRoom = room

    // Update chat
    addSystemMessage(`You selected ${room.name} at ${room.price}.`)

    // Add to conversation history
    chatState.conversationHistory.push({
      role: "system",
      content: `User selected ${room.name} at ${room.price}.`,
    })

    // Update booking summary
    updateBookingSummary()

    // Hide options
    optionsContainer.classList.remove("active")

    // Update chat state
    if (chatState.selectedFlight) {
      chatState.currentStep = "flightAndRoomSelected"
    } else {
      chatState.currentStep = "roomSelected"
    }

    // Offer to complete booking
    setTimeout(() => {
      addBotMessage(templateResponses.roomSelected)
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.roomSelected,
      })
    }, 1000)
  }

  // Show payment form
  function showPaymentForm() {
    if (!paymentTemplate || !optionsContainer) {
      console.error("Payment template or options container not found")
      return
    }

    // Clone the template
    const paymentContent = paymentTemplate.content.cloneNode(true)

    // Clear and show options container
    optionsContainer.innerHTML = ""
    optionsContainer.appendChild(paymentContent)
    optionsContainer.classList.add("active")

    // Calculate total
    let itemType, itemName, dates, total

    if (chatState.selectedRoom) {
      itemType = "Room"
      itemName = chatState.selectedRoom.name

      const checkIn = chatState.checkInDate.toLocaleDateString()
      const checkOut = chatState.checkOutDate.toLocaleDateString()
      dates = `${checkIn} to ${checkOut}`

      // Extract price from string and calculate total
      const pricePerNight = Number.parseInt(chatState.selectedRoom.price.replace(/[^0-9]/g, ""))
      const nights = Math.ceil((chatState.checkOutDate - chatState.checkInDate) / (1000 * 60 * 60 * 24))
      const roomTotal = pricePerNight * nights

      total = `€${roomTotal}`

      if (chatState.selectedFlight) {
        const flightPrice = Number.parseInt(chatState.selectedFlight.price.replace(/[^0-9]/g, ""))
        total = `€${roomTotal + flightPrice}`
      }
    }

    // Replace template variables with actual data
    const summaryItems = paymentContent.querySelectorAll(".summary-item")
    if (summaryItems && summaryItems.length >= 3) {
      summaryItems[0].innerHTML = summaryItems[0].innerHTML
        .replace("{{itemType}}", itemType)
        .replace("{{itemName}}", itemName)

      summaryItems[1].innerHTML = summaryItems[1].innerHTML.replace("{{dates}}", dates)

      summaryItems[2].innerHTML = summaryItems[2].innerHTML.replace("{{total}}", total)
    }

    // Add event listener to complete payment button
    const completePaymentButton = paymentContent.querySelector("#complete-payment")
    if (completePaymentButton) {
      completePaymentButton.addEventListener("click", completeBooking)
    } else {
      console.error("Complete payment button not found")
    }
  }

  // Complete booking
  function completeBooking() {
    // Hide options
    optionsContainer.classList.remove("active")

    // Add to conversation history
    chatState.conversationHistory.push({
      role: "system",
      content: "User completed the booking process.",
    })

    // Show confirmation message
    addBotMessage(templateResponses.bookingComplete)
    chatState.conversationHistory.push({
      role: "assistant",
      content: templateResponses.bookingComplete,
    })

    // Reset chat state for new conversation
    chatState = {
      flightBooked: true, // Set to true since booking is complete
      waitingForFlightBookingAnswer: false,
      waitingForDepartureCity: false,
      waitingForDates: false,
      selectedFlight: chatState.selectedFlight,
      selectedRoom: chatState.selectedRoom,
      departureCity: chatState.departureCity,
      checkInDate: chatState.checkInDate,
      checkOutDate: chatState.checkOutDate,
      currentStep: "bookingComplete",
      conversationHistory: chatState.conversationHistory,
    }
  }

  // Update booking summary
  function updateBookingSummary() {
    if (!bookingSummary) {
      console.error("Booking summary element not found")
      return
    }

    let summaryHTML = "<h3>Your Booking</h3>"

    if (chatState.selectedFlight || chatState.selectedRoom) {
      summaryHTML += '<div class="summary-content">'

      if (chatState.selectedFlight) {
        summaryHTML += `
                  <p><strong>Flight:</strong> ${chatState.selectedFlight.flightNumber}</p>
                  <p>${chatState.selectedFlight.origin} → ${chatState.selectedFlight.destination}</p>
                  <p>${chatState.selectedFlight.date}, ${chatState.selectedFlight.departureTime}</p>
                  <p>${chatState.selectedFlight.price}</p>
              `
      }

      if (chatState.selectedRoom) {
        if (chatState.selectedFlight) summaryHTML += '<hr style="margin: 10px 0; border-color: rgba(0,0,0,0.1);">'

        summaryHTML += `
                  <p><strong>Room:</strong> ${chatState.selectedRoom.name}</p>
              `

        if (chatState.checkInDate && chatState.checkOutDate) {
          summaryHTML += `
                      <p>${chatState.checkInDate.toLocaleDateString()} to ${chatState.checkOutDate.toLocaleDateString()}</p>
                  `
        }

        summaryHTML += `<p>${chatState.selectedRoom.price}</p>`
      }

      summaryHTML += "</div>"
    } else {
      summaryHTML += '<div class="summary-content"><p>No active booking yet</p></div>'
    }

    bookingSummary.innerHTML = summaryHTML
  }

  // Add user message to chat
  function addUserMessage(message) {
    if (!chatMessages) {
      console.error("Chat messages element not found")
      return
    }

    const messageElement = document.createElement("div")
    messageElement.className = "message user"
    messageElement.innerHTML = `<div class="message-content">${message}</div>`
    chatMessages.appendChild(messageElement)
    scrollToBottom()
  }

  // Add bot message to chat
  function addBotMessage(message) {
    if (!chatMessages) {
      console.error("Chat messages element not found")
      return
    }

    const messageElement = document.createElement("div")
    messageElement.className = "message bot"
    messageElement.innerHTML = `<div class="message-content">${message}</div>`
    chatMessages.appendChild(messageElement)
    scrollToBottom()
  }

  // Add system message to chat (for notifications)
  function addSystemMessage(message) {
    if (!chatMessages) {
      console.error("Chat messages element not found")
      return
    }

    const messageElement = document.createElement("div")
    messageElement.className = "message system"
    messageElement.innerHTML = message
    chatMessages.appendChild(messageElement)
    scrollToBottom()
  }

  // Scroll chat to bottom
  function scrollToBottom() {
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  }

  // Clear chat
  function clearChat() {
    if (!chatMessages || !optionsContainer) {
      console.error("Chat messages or options container not found")
      return
    }

    chatMessages.innerHTML = ""
    optionsContainer.innerHTML = ""
    optionsContainer.classList.remove("active")

    // Reset chat state
    chatState = {
      flightBooked: false,
      waitingForFlightBookingAnswer: false,
      waitingForDepartureCity: false,
      waitingForDates: false,
      selectedFlight: null,
      selectedRoom: null,
      departureCity: "",
      checkInDate: null,
      checkOutDate: null,
      currentStep: "greeting",
      conversationHistory: [],
    }

    // Update booking summary
    updateBookingSummary()

    // Restart chat
    setTimeout(() => {
      addBotMessage(templateResponses.greeting)
      chatState.waitingForFlightBookingAnswer = true
      chatState.conversationHistory.push({
        role: "assistant",
        content: templateResponses.greeting,
      })
    }, 500)
  }

  // Initialize the chat when the page loads
  console.log("Setting up chat...")
  initChat()
})
