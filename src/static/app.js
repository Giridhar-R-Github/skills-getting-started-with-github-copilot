document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select (avoid duplicate options on reload)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants section (shows list or a friendly message)
        const participants = details.participants || [];
        let participantsHtml = '<div class="participants"><h5>Participants</h5>';
        if (participants.length > 0) {
          // We'll render the list via DOM so we can attach buttons/handlers
          const ul = document.createElement('ul');
          participants.forEach((p) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.className = 'participant-email';
            span.textContent = p;

            const btn = document.createElement('button');
            btn.className = 'remove-participant';
            btn.setAttribute('aria-label', `Remove ${p} from ${name}`);
            btn.title = 'Remove participant';
            btn.innerHTML = '&times;'; // simple X icon

            // Click handler to remove participant
            btn.addEventListener('click', async () => {
              if (!confirm(`Unregister ${p} from ${name}?`)) return;
              try {
                const res = await fetch(`/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`, {
                  method: 'DELETE',
                });

                if (res.ok) {
                  // remove li from DOM
                  li.remove();
                  // optionally refresh availability text by re-fetching activities
                  // but keep it simple: just update the availability paragraph if present
                  const avail = activityCard.querySelector('p strong');
                  // refetch activities to ensure consistent state
                  fetchActivities();
                } else {
                  const err = await res.json().catch(() => ({}));
                  alert(err.detail || 'Failed to remove participant');
                }
              } catch (error) {
                console.error('Error removing participant:', error);
                alert('Failed to remove participant. See console for details.');
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });

          // Insert the generated list into a temporary container and then into participantsHtml
          const container = document.createElement('div');
          container.appendChild(ul);
          // We'll append the container later into the activityCard
        } else {
          participantsHtml += '<p class="info">No participants yet</p>';
        }
        participantsHtml += '</div>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Append participants block (either generated DOM or info message)
        if (participants.length > 0) {
          const participantsDiv = document.createElement('div');
          participantsDiv.className = 'participants';
          const h5 = document.createElement('h5');
          h5.textContent = 'Participants';
          participantsDiv.appendChild(h5);

          const ul = document.createElement('ul');
          participants.forEach((p) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.className = 'participant-email';
            span.textContent = p;

            const btn = document.createElement('button');
            btn.className = 'remove-participant';
            btn.setAttribute('aria-label', `Remove ${p} from ${name}`);
            btn.title = 'Remove participant';
            btn.innerHTML = '&times;';

            btn.addEventListener('click', async () => {
              if (!confirm(`Unregister ${p} from ${name}?`)) return;
              try {
                const res = await fetch(`/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`, {
                  method: 'DELETE',
                });

                if (res.ok) {
                  li.remove();
                  fetchActivities();
                } else {
                  const err = await res.json().catch(() => ({}));
                  alert(err.detail || 'Failed to remove participant');
                }
              } catch (error) {
                console.error('Error removing participant:', error);
                alert('Failed to remove participant. See console for details.');
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });

          participantsDiv.appendChild(ul);
          activityCard.appendChild(participantsDiv);
        } else {
          const participantsDiv = document.createElement('div');
          participantsDiv.className = 'participants';
          const h5 = document.createElement('h5');
          h5.textContent = 'Participants';
          participantsDiv.appendChild(h5);
          const pInfo = document.createElement('p');
          pInfo.className = 'info';
          pInfo.textContent = 'No participants yet';
          participantsDiv.appendChild(pInfo);
          activityCard.appendChild(participantsDiv);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh the activities list so the UI reflects the new participant immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
