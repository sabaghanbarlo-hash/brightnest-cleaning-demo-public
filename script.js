// BrightNest Cleaning (fictional demo)
// Plain vanilla JavaScript. No libraries, no network requests.

document.addEventListener("DOMContentLoaded", function () {
  setupMobileNav();
  setupFooterYear();
  setupQuoteForm();
  setupInquiryAssistant();
});

/* ---------- Mobile navigation ---------- */
function setupMobileNav() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    toggle.setAttribute("aria-expanded", String(isOpen));
    nav.classList.toggle("is-open", isOpen);
  }

  toggle.addEventListener("click", function () {
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  // Close the menu after choosing a link.
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  // Close with the Escape key and return focus to the button.
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ---------- Footer year ---------- */
function setupFooterYear() {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Quote form ---------- */
function setupQuoteForm() {
  var form = document.getElementById("quote-form");
  if (!form) return;

  var fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    service: document.getElementById("service"),
    message: document.getElementById("message")
  };
  var status = document.getElementById("form-status");
  var counter = document.getElementById("char-count");

  // Live character counter for the message box.
  fields.message.addEventListener("input", function () {
    counter.textContent = fields.message.value.length;
  });

  // Re-check a field when the user leaves it, so errors appear early.
  Object.keys(fields).forEach(function (key) {
    fields[key].addEventListener("blur", function () {
      validateField(key);
    });
    // Clear an existing error as soon as the user fixes the problem.
    fields[key].addEventListener("input", function () {
      if (fields[key].closest(".field").classList.contains("has-error")) {
        validateField(key);
      }
    });
  });

  // Returns an error message, or an empty string if the value is fine.
  function getError(key) {
    var value = fields[key].value.trim();

    if (key === "name") {
      if (value === "") return "Please enter your name.";
      if (value.length < 2) return "Your name should be at least 2 characters.";
    }

    if (key === "email") {
      if (value === "") return "Please enter your email address.";
      // A simple check: something@something.something
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailPattern.test(value)) return "Please enter a valid email address, like name@example.com.";
    }

    if (key === "service") {
      if (value === "") return "Please choose a service type.";
    }

    if (key === "message") {
      if (value === "") return "Please tell us a little about what you need.";
      if (value.length < 10) return "Please write at least 10 characters.";
      if (value.length > 500) return "Please keep your message under 500 characters.";
    }

    return "";
  }

  // Shows or clears the error for one field. Returns true if valid.
  function validateField(key) {
    var input = fields[key];
    var wrapper = input.closest(".field");
    var errorEl = document.getElementById(key + "-error");
    var message = getError(key);

    errorEl.textContent = message;
    wrapper.classList.toggle("has-error", message !== "");
    input.setAttribute("aria-invalid", message !== "" ? "true" : "false");

    return message === "";
  }

  form.addEventListener("submit", function (event) {
    // Always stop the browser's normal submit: this demo never sends data anywhere.
    event.preventDefault();

    var firstInvalid = null;
    Object.keys(fields).forEach(function (key) {
      var ok = validateField(key);
      if (!ok && !firstInvalid) firstInvalid = fields[key];
    });

    if (firstInvalid) {
      status.hidden = true;
      firstInvalid.focus();
      return;
    }

    var firstName = fields.name.value.trim().split(/\s+/)[0];
    var serviceLabel = fields.service.options[fields.service.selectedIndex].text;

    showConfirmation(firstName, serviceLabel);

    form.reset();
    counter.textContent = "0";
    Object.keys(fields).forEach(function (key) {
      fields[key].removeAttribute("aria-invalid");
    });
  });

  function showConfirmation(firstName, serviceLabel) {
    // Build with textContent (not innerHTML) so typed text is never treated as code.
    status.textContent = "";

    var title = document.createElement("strong");
    title.textContent = "Demo request received. Thank you, " + firstName + "!";

    var detail = document.createElement("p");
    detail.textContent = "Service selected: " + serviceLabel + ".";

    var disclaimer = document.createElement("p");
    disclaimer.textContent =
      "This is a demonstration only. No email was sent and nothing was saved or stored.";

    status.appendChild(title);
    status.appendChild(detail);
    status.appendChild(disclaimer);
    status.hidden = false;
    status.focus();
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}


/* ---------- Cleaning inquiry assistant (local-only demo) ---------- */
function setupInquiryAssistant() {
  var launcher = document.getElementById("assistant-launcher");
  var panel = document.getElementById("assistant-panel");
  var close = document.getElementById("assistant-close");
  var form = document.getElementById("assistant-form");
  var status = document.getElementById("assistant-status");
  var messages = document.getElementById("assistant-messages");
  if (!launcher || !panel || !close || !form) return;

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) document.getElementById("assistant-service").focus();
    else launcher.focus();
  }
  launcher.addEventListener("click", function () { setOpen(panel.hidden); });
  close.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var data = Object.fromEntries(new FormData(form).entries());
    var lead = {
      id: "demo-" + Date.now(),
      service: data.service,
      homeSize: data.homeSize,
      area: data.area.trim(),
      preferredDate: data.preferredDate,
      name: data.name.trim(),
      email: data.email.trim(),
      createdAt: new Date().toISOString(),
      demoOnly: true
    };
    try {
      var leads = JSON.parse(localStorage.getItem("brightnest_demo_leads") || "[]");
      if (!Array.isArray(leads)) leads = [];
      leads.push(lead);
      localStorage.setItem("brightnest_demo_leads", JSON.stringify(leads));
      messages.textContent = "";
      var reply = document.createElement("p");
      reply.className = "assistant-message";
      reply.textContent = "Thanks, " + lead.name.split(/\s+/)[0] + "! Your demo request is prepared for " + lead.service.toLowerCase() + ". This prototype saved it only in this browser; it did not send an email or notify a cleaning company.";
      messages.appendChild(reply);
      form.hidden = true;
      status.textContent = "Demo request saved locally on this device.";
    } catch (error) {
      status.textContent = "Your browser could not save this demo request. No details were sent.";
    }
  });
}
