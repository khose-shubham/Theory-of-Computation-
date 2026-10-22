/*
    ATM TRANSACTION VERIFICATION
    USING TURING MACHINE

    Turing Machine:

    M = (Q, Σ, Γ, δ, q0, B, F)

    q0 -> Start
    q1 -> Card Validation
    q2 -> PIN Authentication
    q3 -> Transaction Selection
    q4 -> Balance Verification
    q5 -> Cash Dispensing
    q6 -> Account Update
    q7 -> Receipt Generation

    q_accept -> Successful transaction
    q_reject -> Failed transaction
*/


// =====================================================
// TURING MACHINE VARIABLES
// =====================================================

let tape = [];

let head = 0;

let currentState = "q0";

let stepCount = 0;

let running = false;

let timer = null;


// =====================================================
// TRANSITION TABLE
// =====================================================

/*
    δ(currentState, readSymbol)
    =
    (writeSymbol, movement, nextState)

    Movement:
    R = Move Right
    L = Move Left
    S = Stay
*/

const transitions = {

    q0: {

        VALID: {
            write: "VALID",
            move: "R",
            next: "q1"
        },

        INVALID: {
            write: "INVALID",
            move: "S",
            next: "q_reject"
        }

    },


    q1: {

        PIN_OK: {
            write: "PIN_OK",
            move: "R",
            next: "q2"
        },

        PIN_FAIL: {
            write: "PIN_FAIL",
            move: "S",
            next: "q_reject"
        }

    },


    q2: {

        WITHDRAW: {
            write: "WITHDRAW",
            move: "R",
            next: "q3"
        },

        BALANCE: {
            write: "BALANCE",
            move: "R",
            next: "q3"
        },

        INVALID_TXN: {
            write: "INVALID_TXN",
            move: "S",
            next: "q_reject"
        }

    },


    q3: {

        SUFFICIENT: {
            write: "SUFFICIENT",
            move: "R",
            next: "q4"
        },

        INSUFFICIENT: {
            write: "INSUFFICIENT",
            move: "S",
            next: "q_reject"
        }

    },


    q4: {

        CASH_READY: {
            write: "CASH_READY",
            move: "R",
            next: "q5"
        },

        BALANCE_CHECK: {
            write: "BALANCE_CHECK",
            move: "R",
            next: "q7"
        }

    },


    q5: {

        CASH_DISPENSED: {
            write: "CASH_DISPENSED",
            move: "R",
            next: "q6"
        }

    },


    q6: {

        ACCOUNT_UPDATED: {
            write: "ACCOUNT_UPDATED",
            move: "R",
            next: "q7"
        }

    },


    q7: {

        RECEIPT_PRINTED: {
            write: "RECEIPT_PRINTED",
            move: "R",
            next: "q_accept"
        }

    }

};


// =====================================================
// INITIALIZE MACHINE
// =====================================================

function initializeMachine() {

    pauseMachine();

    const card =
        document.getElementById("card").value;

    const pin =
        document.getElementById("pin").value;

    const transaction =
        document.getElementById("transaction").value;

    const amount =
        Number(document.getElementById("amount").value);

    const balance =
        Number(document.getElementById("balance").value);


    /*
        Convert ATM input into
        Turing Machine tape symbols.
    */

    tape = [];


    // -----------------------------------------
    // CARD
    // -----------------------------------------

    if (card === "VALID") {

        tape.push("VALID");

    } else {

        tape.push("INVALID");

    }


    // -----------------------------------------
    // PIN
    // -----------------------------------------

    if (pin === "1234") {

        tape.push("PIN_OK");

    } else {

        tape.push("PIN_FAIL");

    }


    // -----------------------------------------
    // TRANSACTION
    // -----------------------------------------

    if (transaction === "WITHDRAW") {

        tape.push("WITHDRAW");

    } else {

        tape.push("BALANCE");

    }


    // -----------------------------------------
    // BALANCE
    // -----------------------------------------

    if (transaction === "WITHDRAW") {

        if (amount <= balance) {

            tape.push("SUFFICIENT");

        } else {

            tape.push("INSUFFICIENT");

        }

        tape.push("CASH_READY");

        tape.push("CASH_DISPENSED");

        tape.push("ACCOUNT_UPDATED");

    } else {

        tape.push("BALANCE_CHECK");

    }


    // -----------------------------------------
    // RECEIPT
    // -----------------------------------------

    tape.push("RECEIPT_PRINTED");


    // Reset TM
    head = 0;

    currentState = "q0";

    stepCount = 0;

    running = false;


    updateUI();

    clearTrace();

    addTrace(
        "Machine initialized",
        "Tape loaded successfully."
    );


    document.getElementById("machineStatus").innerText =
        "READY";

    document.getElementById("result").className =
        "result";

    document.getElementById("result").innerText = "";


    document.getElementById("transition").innerText =
        "Waiting for first transition...";
}


// =====================================================
// ONE TURING MACHINE STEP
// =====================================================

function stepMachine() {

    /*
        If tape is empty,
        initialize first.
    */

    if (tape.length === 0) {

        initializeMachine();

        return;
    }


    /*
        If machine has already halted,
        don't execute anything.
    */

    if (
        currentState === "q_accept" ||
        currentState === "q_reject"
    ) {

        return;
    }


    // -----------------------------------------
    // READ CURRENT SYMBOL
    // -----------------------------------------

    const readSymbol =
        tape[head];


    // -----------------------------------------
    // FIND TRANSITION
    // -----------------------------------------

    const rule =
        transitions[currentState]?.[readSymbol];


    /*
        If no transition exists,
        reject the input.
    */

    if (!rule) {

        currentState = "q_reject";

        document.getElementById("machineStatus").innerText =
            "REJECTED";

        showResult(
            "Transaction rejected: No valid transition found.",
            false
        );

        updateUI();

        return;
    }


    // -----------------------------------------
    // SAVE OLD STATE
    // -----------------------------------------

    const oldState =
        currentState;


    // -----------------------------------------
    // WRITE SYMBOL
    // -----------------------------------------

    tape[head] =
        rule.write;


    // -----------------------------------------
    // MOVE HEAD
    // -----------------------------------------

    if (rule.move === "R") {

        head++;

    }

    else if (rule.move === "L") {

        head--;

        if (head < 0) {
            head = 0;
        }

    }


    // -----------------------------------------
    // CHANGE STATE
    // -----------------------------------------

    currentState =
        rule.next;


    // -----------------------------------------
    // INCREMENT STEP COUNT
    // -----------------------------------------

    stepCount++;


    // -----------------------------------------
    // DISPLAY TRANSITION
    // -----------------------------------------

    document.getElementById("transition").innerHTML =

        `δ(${oldState}, ${readSymbol})
        → (${rule.write}, ${rule.move}, ${rule.next})`;


    // -----------------------------------------
    // ADD EXECUTION TRACE
    // -----------------------------------------

    addTrace(

        `${oldState} → ${rule.next}`,

        `Read: ${readSymbol}
         | Write: ${rule.write}
         | Move: ${rule.move}`

    );


    // -----------------------------------------
    // UPDATE SCREEN
    // -----------------------------------------

    updateUI();


    // -----------------------------------------
    // ACCEPT
    // -----------------------------------------

    if (currentState === "q_accept") {

        pauseMachine();

        document.getElementById("machineStatus").innerText =
            "ACCEPTED";

        showResult(
            "✓ Transaction accepted successfully.",
            true
        );

    }


    // -----------------------------------------
    // REJECT
    // -----------------------------------------

    if (currentState === "q_reject") {

        pauseMachine();

        document.getElementById("machineStatus").innerText =
            "REJECTED";

        showResult(
            "✕ Transaction rejected.",
            false
        );

    }

}


// =====================================================
// RUN MACHINE AUTOMATICALLY
// =====================================================

function runMachine() {

    if (running) {
        return;
    }


    if (tape.length === 0) {

        initializeMachine();

    }


    running = true;


    document.getElementById("machineStatus").innerText =
        "RUNNING";


    timer = setInterval(function () {

        if (
            currentState === "q_accept" ||
            currentState === "q_reject"
        ) {

            pauseMachine();

            return;
        }


        stepMachine();

    }, 900);

}


// =====================================================
// PAUSE MACHINE
// =====================================================

function pauseMachine() {

    running = false;


    if (timer !== null) {

        clearInterval(timer);

        timer = null;

    }


    if (
        currentState !== "q_accept" &&
        currentState !== "q_reject" &&
        tape.length > 0
    ) {

        document.getElementById("machineStatus").innerText =
            "PAUSED";

    }

}


// =====================================================
// RESET MACHINE
// =====================================================

function resetMachine() {

    pauseMachine();

    tape = [];

    head = 0;

    currentState = "q0";

    stepCount = 0;


    document.getElementById("machineStatus").innerText =
        "IDLE";


    document.getElementById("currentState").innerText =
        "q0";


    document.getElementById("headPosition").innerText =
        "0";


    document.getElementById("steps").innerText =
        "0";


    document.getElementById("headLabel").innerText =
        "HEAD: 0";


    document.getElementById("tape").innerHTML = "";


    document.getElementById("transition").innerText =
        "Waiting for machine...";


    document.getElementById("result").className =
        "result";


    document.getElementById("result").innerText = "";


    clearTrace();

    renderTransitionTable();

}


// =====================================================
// UPDATE UI
// =====================================================

function updateUI() {


    // State

    document.getElementById("currentState").innerText =
        currentState;


    // Head

    document.getElementById("headPosition").innerText =
        head;


    // Steps

    document.getElementById("steps").innerText =
        stepCount;


    // Head label

    document.getElementById("headLabel").innerText =
        "HEAD: " + head;


    // Render tape

    renderTape();


    // Highlight transition table

    highlightCurrentState();

}


// =====================================================
// RENDER TAPE
// =====================================================

function renderTape() {

    const tapeElement =
        document.getElementById("tape");


    tapeElement.innerHTML = "";


    tape.forEach(function(symbol, index) {


        const cell =
            document.createElement("div");


        cell.className =
            "tape-cell";


        if (index === head) {

            cell.classList.add("active");

        }


        cell.innerText =
            symbol;


        // Tape index

        const indexElement =
            document.createElement("span");


        indexElement.className =
            "tape-index";


        indexElement.innerText =
            index;


        cell.appendChild(indexElement);


        // Head label

        if (index === head) {

            const headElement =
                document.createElement("div");


            headElement.className =
                "head";


            headElement.innerText =
                "▼ HEAD";


            cell.appendChild(headElement);

        }


        tapeElement.appendChild(cell);

    });

}


// =====================================================
// EXECUTION TRACE
// =====================================================

function addTrace(title, description) {

    const trace =
        document.getElementById("trace");


    const empty =
        trace.querySelector(".empty");


    if (empty) {

        empty.remove();

    }


    const item =
        document.createElement("div");


    item.className =
        "trace-item";


    item.innerHTML = `

        <strong>${title}</strong>

        <small>
            ${description}
        </small>

    `;


    trace.prepend(item);

}


// =====================================================
// CLEAR TRACE
// =====================================================

function clearTrace() {

    document.getElementById("trace").innerHTML = `

        <p class="empty">
            No transitions executed yet.
        </p>

    `;

}


// =====================================================
// RESULT
// =====================================================

function showResult(message, success) {

    const result =
        document.getElementById("result");


    result.innerText =
        message;


    result.className =
        success
            ? "result success"
            : "result error";

}


// =====================================================
// TRANSITION TABLE
// =====================================================

function renderTransitionTable() {

    const table =
        document.getElementById("transitionTable");


    table.innerHTML = "";


    Object.keys(transitions).forEach(function(state) {


        Object.keys(transitions[state]).forEach(function(symbol) {


            const rule =
                transitions[state][symbol];


            const row =
                document.createElement("tr");


            row.dataset.state =
                state;


            row.innerHTML = `

                <td>${state}</td>

                <td>${symbol}</td>

                <td>${rule.write}</td>

                <td>${rule.move}</td>

                <td>${rule.next}</td>

            `;


            table.appendChild(row);

        });

    });

}


// =====================================================
// HIGHLIGHT CURRENT STATE
// =====================================================

function highlightCurrentState() {

    const rows =
        document.querySelectorAll(
            "#transitionTable tr"
        );


    rows.forEach(function(row) {

        row.classList.remove("active-row");


        if (
            row.dataset.state === currentState
        ) {

            row.classList.add("active-row");

        }

    });

}


// =====================================================
// INITIAL PAGE LOAD
// =====================================================

renderTransitionTable();
