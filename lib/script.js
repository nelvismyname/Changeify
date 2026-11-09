const peopleContainer = document.getElementById("people")
const convertToCents = value => Math.round((parseFloat(value) || 0) * 100)
const formatAmount = cents => (cents / 100).toFixed(2)
const updateItemRemoveButtons = personElement => {
    const itemRows = personElement.querySelectorAll(".items .row")
    itemRows.forEach(row => {
        row.querySelector(".remove").disabled = itemRows.length === 1
    })
}

const addItem = personElement => {
    const itemRow = document.createElement("div")
    itemRow.className = "row"
    itemRow.innerHTML = `<input class="price" type="number" step="0.01" min="0" placeholder="Price"><button class="remove">Remove</button>`
    itemRow.querySelector(".remove").onclick = () => {
        if (personElement.querySelectorAll(".items .row").length === 1) return
        itemRow.remove()
        updateItemRemoveButtons(personElement)
        updateAllPeople()
    }
    
    personElement.querySelector(".items").appendChild(itemRow)
    updateItemRemoveButtons(personElement)
}

const updatePersonRemoveButtons = () => {
    const isOnlyPerson = peopleContainer.children.length === 1
    peopleContainer.querySelectorAll(".nameRow .remove").forEach(button => {
        button.disabled = isOnlyPerson
    })
}

const addPerson = () => {
    const personElement = document.createElement("div")
    personElement.className = "person"
    personElement.innerHTML = `
    <div class="row nameRow"><textarea class="name" rows="1" placeholder="Name"></textarea><button class="remove">Remove</button></div>
    <div class="items"></div>
    <div class="row"><button class="addItem">+ Item</button></div>
    <div class="row"><input class="given" type="number" step="0.01" min="0" placeholder="Amount given"></div>
    <div>Items total: <span class="total">0.00</span></div>
    <div class="result"></div>`
    peopleContainer.appendChild(personElement)
    updatePersonRemoveButtons()

    const nameInput = personElement.querySelector(".name")
    nameInput.addEventListener("input", () => {
        nameInput.style.height = "auto"
        nameInput.style.height = `${nameInput.scrollHeight}px`
    })

    personElement.querySelector(".addItem").onclick = () => {
        addItem(personElement);
        updateAllPeople()
    }

    personElement.querySelector(".remove").onclick = () => {
        if (peopleContainer.children.length === 1) return
        personElement.remove()
        updatePersonRemoveButtons()
    }

    personElement.oninput = updateAllPeople
    addItem(personElement)
}

const updateAllPeople = () => {
    [...peopleContainer.children].forEach(personElement => {
        const itemsTotal = [...personElement.querySelectorAll(".price")].reduce((total, priceInput) => total + convertToCents(priceInput.value), 0)
        const givenValue = personElement.querySelector(".given").value
        const resultElement = personElement.querySelector(".result")
        const difference = convertToCents(givenValue) - itemsTotal

        personElement.querySelector(".total").textContent = formatAmount(itemsTotal)
        resultElement.className = "result"

        if (givenValue === "" && itemsTotal === 0) {
            resultElement.textContent = ""
            return
        }

        resultElement.textContent = difference >= 0 ? "Change: " + formatAmount(difference) : "Short: " + formatAmount(-difference)
        resultElement.classList.add(difference >= 0 ? "plus" : "minus")
    })
}

document.getElementById("addPerson").onclick = addPerson
addPerson()