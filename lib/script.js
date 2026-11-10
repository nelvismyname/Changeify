const peopleContainer = document.getElementById("people")
const changeSummary = document.getElementById("changeSummary")
const summaryPeople = changeSummary.querySelector(".summaryPeople")
const saveReceiptButton = document.getElementById("saveReceipt")
const receiptStatus = document.getElementById("receiptStatus")
const convertToCents = value => Math.round((parseFloat(value) || 0) * 100)
const formatAmount = cents => (cents / 100).toFixed(2)
let receiptEntries = []

const updateItemRemoveButtons = personElement => {
    const itemRows = personElement.querySelectorAll(".items .row")
    itemRows.forEach(row => {
        row.querySelector(".remove").disabled = itemRows.length === 1
    })
}

const updateFeeRemoveButtons = personElement => {
    const feeRows = personElement.querySelectorAll(".fees .feeRow")
    feeRows.forEach(row => {
        row.querySelector(".remove").disabled = feeRows.length === 1
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

const addFee = (personElement, name = "Other fee") => {
    const feeRow = document.createElement("div")
    feeRow.className = "row feeRow"

    const feeName = document.createElement("input")
    feeName.className = "feeName"
    feeName.type = "text"
    feeName.placeholder = "Fee name"
    feeName.value = name

    const feeAmount = document.createElement("input")
    feeAmount.className = "feeAmount"
    feeAmount.type = "number"
    feeAmount.step = "0.01"
    feeAmount.min = "0"
    feeAmount.placeholder = "Fee amount"

    const removeButton = document.createElement("button")
    removeButton.className = "remove"
    removeButton.textContent = "Remove"
    removeButton.onclick = () => {
        if (personElement.querySelectorAll(".fees .feeRow").length === 1) return
        feeRow.remove()
        updateFeeRemoveButtons(personElement)
        updateAllPeople()
    }

    feeRow.append(feeName, feeAmount, removeButton)
    personElement.querySelector(".fees").appendChild(feeRow)
    updateFeeRemoveButtons(personElement)
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
    <div class="feeSection"><strong>Extra fees</strong><div class="fees"></div><div class="row"><button class="addFee">+ Fee</button></div></div>
    <div><span class="totalLabel">Total:</span> <span class="total">0.00</span></div>
    <div class="row"><input class="given" type="number" step="0.01" min="0" placeholder="Amount given"></div>`
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

    personElement.querySelector(".addFee").onclick = () => {
        addFee(personElement)
        updateAllPeople()
    }

    personElement.querySelector(".remove").onclick = () => {
        if (peopleContainer.children.length === 1) return
        personElement.remove()
        updatePersonRemoveButtons()
        updateAllPeople()
    }

    personElement.oninput = updateAllPeople
    addItem(personElement)
    addFee(personElement, "Shipping")
}

const updateAllPeople = () => {
    const summaryEntries = []
    receiptEntries = []

    peopleContainer.querySelectorAll(".person").forEach((personElement, index) => {
        const itemsTotal = [...personElement.querySelectorAll(".price")].reduce((total, priceInput) => total + convertToCents(priceInput.value), 0)
        const fees = [...personElement.querySelectorAll(".feeRow")].map(feeRow => ({
            name: feeRow.querySelector(".feeName").value.trim() || "Fee",
            amount: convertToCents(feeRow.querySelector(".feeAmount").value)
        })).filter(fee => fee.amount > 0)
        const feesTotal = fees.reduce((total, fee) => total + fee.amount, 0)
        const total = itemsTotal + feesTotal
        const givenInput = personElement.querySelector(".given")
        const givenValue = givenInput.value
        const difference = convertToCents(givenValue) - total

        personElement.querySelector(".total").textContent = formatAmount(total)
        personElement.querySelector(".totalLabel").textContent = fees.length ? "Total including fees:" : "Total:"

        if (givenValue === "" && total === 0) {
            return
        }

        const entryData = {
            name: personElement.querySelector(".name").value.trim() || `Person ${index + 1}`,
            paid: convertToCents(givenValue),
            items: itemsTotal,
            fees,
            total,
            difference
        }
        receiptEntries.push(entryData)

        const entry = document.createElement("div")
        entry.className = "summaryEntry"

        const personName = document.createElement("strong")
        personName.textContent = entryData.name
        entry.appendChild(personName)

        const breakdown = document.createElement("div")
        breakdown.className = "summaryBreakdown"
        const feeBreakdown = entryData.fees.length
            ? ` | ${entryData.fees.map(fee => `${fee.name}: ${formatAmount(fee.amount)}`).join(", ")}`
            : ""
        const totalLabel = entryData.fees.length ? "Total including fees:" : "Total:"
        breakdown.textContent = `Paid: ${formatAmount(entryData.paid)} | Items: ${formatAmount(entryData.items)}${feeBreakdown} | ${totalLabel} ${formatAmount(entryData.total)}`
        entry.appendChild(breakdown)

        const result = document.createElement("div")
        result.className = entryData.difference >= 0 ? "plus" : "minus"
        result.textContent = entryData.difference >= 0
            ? `Change to return: ${formatAmount(entryData.difference)}`
            : `Still owed: ${formatAmount(-entryData.difference)}`
        entry.appendChild(result)

        summaryEntries.push(entry)
    })

    summaryPeople.replaceChildren(...summaryEntries)
    changeSummary.hidden = summaryEntries.length === 0
    receiptStatus.textContent = ""
}

const saveReceipt = () => {
    const scale = 2
    const width = 720
    const padding = 48
    const entryHeights = receiptEntries.map(entry => 120 + entry.fees.length * 25)
    const height = 220 + entryHeights.reduce((total, entryHeight) => total + entryHeight, 0) + padding + 60
    const canvas = document.createElement("canvas")
    canvas.width = width * scale
    canvas.height = height * scale

    const context = canvas.getContext("2d")
    if (!context) {
        receiptStatus.textContent = "Could not create the receipt image. Please try another browser."
        return
    }

    context.scale(scale, scale)
    context.fillStyle = "#fff"
    context.fillRect(0, 0, width, height)
    context.fillStyle = "#000"
    context.textAlign = "center"
    context.font = "600 34px Inter, Arial, sans-serif"
    context.fillText("Changeify", width / 2, 66)
    context.font = "18px Inter, Arial, sans-serif"
    context.fillStyle = "#555"
    context.fillText("Change summary receipt", width / 2, 100)
    context.fillText(new Date().toLocaleString(), width / 2, 132)

    context.strokeStyle = "#bbb"
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(padding, 158)
    context.lineTo(width - padding, 158)
    context.stroke()

    let top = 198
    receiptEntries.forEach((entry, index) => {
        context.textAlign = "left"
        context.fillStyle = "#000"
        context.font = "600 22px Inter, Arial, sans-serif"
        context.fillText(entry.name, padding, top, width - padding * 2)

        context.font = "18px Inter, Arial, sans-serif"
        context.fillStyle = "#444"
        context.fillText(`Paid: ${formatAmount(entry.paid)}`, padding, top + 34)
        context.fillText(`Items: ${formatAmount(entry.items)}`, padding + 290, top + 34)

        entry.fees.forEach((fee, feeIndex) => {
            context.fillText(`${fee.name}: ${formatAmount(fee.amount)}`, padding, top + 60 + feeIndex * 25, width - padding * 2)
        })

        const totalTop = top + 60 + entry.fees.length * 25
        context.font = "600 18px Inter, Arial, sans-serif"
        context.fillStyle = "#000"
        const totalLabel = entry.fees.length ? "Total including fees:" : "Total:"
        context.fillText(`${totalLabel} ${formatAmount(entry.total)}`, padding, totalTop, width - padding * 2)

        context.font = "600 20px Inter, Arial, sans-serif"
        context.fillStyle = entry.difference >= 0 ? "#006400" : "#b00000"
        context.fillText(
            entry.difference >= 0
                ? `Change to return: ${formatAmount(entry.difference)}`
                : `Still owed: ${formatAmount(-entry.difference)}`,
            padding,
            totalTop + 32,
            width - padding * 2
        )

        top += entryHeights[index]
    })

    context.textAlign = "center"
    context.font = "14px Inter, Arial, sans-serif"
    context.fillStyle = "#777"
    context.fillText("made by nelvismyname • nelvismyname.github.io/Changeify/", width / 2, top + 30)

    canvas.toBlob(blob => {
        if (!blob) {
            receiptStatus.textContent = "Could not save the receipt image. Please try again."
            return
        }

        const downloadUrl = URL.createObjectURL(blob)
        const downloadLink = document.createElement("a")
        downloadLink.href = downloadUrl
        downloadLink.download = `changeify-receipt-${new Date().toISOString().slice(0, 10)}.png`
        downloadLink.click()
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
        receiptStatus.textContent = "Receipt picture saved."
    }, "image/png")
}

saveReceiptButton.addEventListener("click", saveReceipt)
document.getElementById("addPerson").onclick = addPerson
addPerson()