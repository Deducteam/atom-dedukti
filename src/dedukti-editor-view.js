class DeduktiEditorView {
  constructor() {
    // DATA :
    this.FocusView = [];
    this.initialized = false;

    this.element = this.createCustomElement(
      "div",
      ["dedukti-editor"],
      [{ name: "id", value: "proofview" }],
      null,
      null
    );

  }

  getDefaultLocation() {
    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'right';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['right'];
}

  initialize(){

    // Web page generated by the dom API

    // Create root element
    this.element = this.createCustomElement(
      "div",
      ["dedukti-editor"],
      [{ name: "id", value: "proofview" }],
      null,
      null
    );

    //First title
    this.proof = this.createCustomElement(
      "h2",
      ["highlight", "title-goals"],
      [],
      "Goals (FocusView list just as an example)",
      this.element
    );

    //The tree
    this.list_of_proof = this.createCustomElement(
      "table",
      ["goalstable"],
      [{ name: "align", value: "center" }],
      null,
      this.element
    );

    //Second Title
    this.focus = this.createCustomElement(
      "h2",
      ["highlight", "title-goals"],
      [],
      "Focus",
      this.element
    );

    //List of Hypothesis :
    this.list_of_hypothesis = this.createCustomElement(
      "table",
      ["list_of_hypothesis"],
      [{ name: "align", value: "center" }],
      null,
      this.element
    );

    //bar
    this.bar = this.createCustomElement(
      "hr",
      ["bar-proof"],
      [],
      null,
      this.element
    );

    //Current objective
    this.current_objective = this.createCustomElement(
      "h3",
      ["proof-objectif", "text-highlight"],
      [],
      "Exemple d'objectif courant",
      this.element
    );

    //Button toolbar at the buttom of the page :
    this.div_button = this.createCustomElement(
      "div",
      ["btn-toolbar", "proof-button"],
      [{name : "align", value:"center"}],
      null,
      this.element
    );

    //First goup of buttons :
    this.div_button_first = this.createCustomElement(
      "div",
      ["btn-group"],
      [],
      null,
      this.div_button
    );


    // Buttons :

    this.but2 = this.createCustomElement(
      "button",
      ["btn"],
      [{ name: "id", value: "second" }],
      "Next Step",
      this.div_button_first
    );
    this.but3 = this.createCustomElement(
      "button",
      ["btn"],
      [{ name: "id", value: "third" }],
      "Previous Step",
      this.div_button_first
    );

    this.but1 = this.createCustomElement(
      "button",
      ["btn"],
      [{ name: "id", value: "first" }],
      "Update",
      this.div_button_first
    );

    //Second group of buttons :

    this.updatetype  = this.createCustomElement(
      "label",
      ["input-label"],
      [],
      "update Automatically ",
      this.div_button
    )

    this.input  = this.createCustomElement(
      "input",
      ["input-toggle"],
      [{name:"type", value:"checkbox"},{name:"checked",value:""}],
      null,
      this.updatetype
    )

    this.initialized = true;
  }


  isInitialized(){ // This function is used to check if the basic elements of the view are created
    return this.initialized;
  }


  /* This function help us creating the element we need on our web page */
  createCustomElement(type, classlist, attributes, textcontent, parentnode) {
    let element = document.createElement(type);
    let i;

    for (i = 0; i < classlist.length; i++) {
      element.classList.add(classlist[i]);
    }

    for (i = 0; i < attributes.length; i++) {
      element.setAttribute(attributes[i].name, attributes[i].value);
    }

    if (textcontent != null) {
      element.textContent = textcontent;
    }

    if (parentnode != null) {
      parentnode.appendChild(element);
    }

    return element;
  }

  /* A couple of basic functions to handle the view */
  getElement() {
    return this.element;
  }

  getTitle() {
    // Title of the Information Panel
    return "Proof Assistant";
  }

  getURI() {
    // Title of the Information Panel
    return "atom://dedukti-editor-info";
  }


  // An example to show how the view is looking.
  initialise_exemple() {
    // Just an example
    let i;
    let datadisplayed = [];
    for (i = 0; i < this.FocusView.length; i++) {
      if (!datadisplayed.includes(this.FocusView[i].goal)) {
        datadisplayed.push({
          goal: this.FocusView[i].goal,
          point: this.FocusView[i].range.start
        });
      }
    }

    this.setGoals(datadisplayed, atom.workspace.getActiveTextEditor());
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  /* We get the data from diagnostics for the moment */
  updateDiagnostics(data, text_editor_path) {
    this.FocusView = [];
    //console.log(data);
    let i;
    //console.log("initialisation");
    for (i = 0; i < data.length; i++) {
      if (data[i].goal_fg != null) {
        // We get the hypothesis and the goal
        let curentobj = data[i].goal_fg.type;
        let goalhypothesis = data[i].goal_fg.hyps;

        this.FocusView.push({
          path: text_editor_path,
          range: data[i].range,
          goal: curentobj,
          hypothesis: goalhypothesis
        });
      }
    }

    this.initialise_exemple();

    return data;
  }

  // A function to update the focus part of the view when it's needed
  updateView(selection, editor) {
    let path = editor.getPath();
    let i = 0;
    // We check the selection is actually a point
    if (
      selection.newScreenRange.start.row == selection.newScreenRange.end.row &&
      selection.newScreenRange.start.column ==
        selection.newScreenRange.end.column
    ) {
      // we create some alias to clean the code
      let row = selection.newScreenRange.start.row;
      let column = selection.newScreenRange.start.column;
      let none_objective = 0; //If no FocusView is associated with the cursor position

      for (i = 0; i < this.FocusView.length; i++) {
        // we find the focusView associated with the cursor position
        if (
          this.rangewithin(
            this.FocusView[i].path,
            this.FocusView[i].range.start.line,
            this.FocusView[i].range.end.line,
            this.FocusView[i].range.start.character,
            this.FocusView[i].range.end.character,
            path,
            row,
            column
          )
        ) {
          // we display the information contained in the focusView.
          this.setCurrentObjectif(this.FocusView[i].goal);
          this.setHypothesis(this.FocusView[i].hypothesis);
          //this.markGoal(this.FocusView[i].goal); //Ultimately, we want to provide some visual information to the user.
          none_objective = 1;
        }
      }
      if (none_objective === 0) {
        //If no FocusView is associated with the cursor position
        this.setCurrentObjectif("");
        this.cleanHypothesis();
      }
    }
  }

  /* A couple of function tu update each part of the view */

  //update the current objective
  setCurrentObjectif(current) {
    this.current_objective.innerText = current;
  }

  //update the hypothesis list
  setHypothesis(hypothesis) {
    let i = 0;
    this.cleanHypothesis(); // We begin by erased what was displayed before on the hypothesis list

    //console.log(hypothesis);
    // Then, we display the hypothesis we want
    for (i = 0; i < hypothesis.length; i++) {
      let list_element = this.createCustomElement(
        "tr",
        ["focus_data"],
        [],
        null,
        this.list_of_hypothesis
      );

      let firstcol = this.createCustomElement(
        "td",
        ["hyponame"],
        [],
        hypothesis[i].hname,
        list_element
      );

      let secondcol = this.createCustomElement(
        "td",
        ["hypodot"],
        [],
        " : ",
        list_element
      );

      let thirdcol = this.createCustomElement(
        "td",
        ["hypotype"],
        [],
        hypothesis[i].htype,
        list_element
      );

      //hypothesis[i].hname + " : " + hypothesis[i].htype

    }
  }

  //update the goals list (need a bit of rewrite)
  setGoals(goallist, editor) {
    this.cleanGoals();
    let i = 0;

    for (i = 0; i < goallist.length; i++) {
      let line = this.createCustomElement(
        "tr",
        ["goalline"],
        [],
        null,
        this.list_of_proof
      );

      //We create the element we need to display a list of goals
      let firstcol = this.createCustomElement(
        "td",
        ["goalcolumn"],
        [],
        goallist[i].goal,
        line
      );
      let secondcol = this.createCustomElement(
        "td",
        ["goalcolumn"],
        [],
        null,
        line
      );
      let btn = this.createCustomElement(
        "button",
        ["btn", "btn-xs", "btn-info"],
        [],
        "go !",
        secondcol
      );

      //We create a listener for each buttons we add.
      this.addNewListener(goallist, i, btn, editor);
    }
  }

  addNewListener(goallist, index, button, editor) {
    //We create a listener for each buttons we add.

    //The aim of this function is to redirect the user cursor to a proof.
    button.addEventListener("click", function() {
      //When we click on the button, the cursor is move to the adapted area.
      editor.setCursorScreenPosition([
        goallist[index].point.line,
        goallist[index].point.character
      ]);
    });

    //this.markgoal(goallist[index].goal); //TODO : add an UI element to help the user find what is looking for.
  }

  /* A couple of functions to clean the view */
  cleanHypothesis() {
    while (this.list_of_hypothesis.firstChild) {
      this.list_of_hypothesis.removeChild(this.list_of_hypothesis.firstChild);
    }
  }

  cleanGoals() {
    while (this.list_of_proof.firstChild) {
      this.list_of_proof.removeChild(this.list_of_proof.firstChild);
    }
  }

  /* A couple of function to enhance the user experience */

  //The aim of this function is to help the user finding which part of the goals list is related to the focus.
  markGoal(goalstring) {
    /*
    let oldgoal = this.list_of_proof.getElementsByClassName("text-info");
    console.log(oldgoal);
    if( oldgoal = null){
      oldgoal.classList.remove("text-info");
    }
    */

    let goals = this.list_of_proof.getElementsByClassName("goals");
    //console.log(goals);
    let i = 0;
    let find = 0;

    while (find === 0 && i < goals.length) {
      //console.log(goals[i].innerText);
      //console.log(goalstring);
      //console.log(goalstring.includes(goals[i].innerText));
      if (goalstring.includes(goals[i].innerText)) {
        goals[i].classList.add("text-info");
        find = 1;
      }
      i++;
    }
  }

  /* Two function to handle key binding */
  nextFocus() {
    //All variables we need
    let editor = atom.workspace.getActiveTextEditor();
    let cursor = editor.getCursorScreenPosition();
    let path = editor.getPath();
    //This function return the closest next focus view to our current cursor.
    let point = this.closerNextRange(path, cursor.row, cursor.column);

    if (point != null) {
      //We check a next focus view actually exists.
      editor.setCursorScreenPosition([point.line, point.character]); //We move the cursor
    }
  }

  lastFocus() {
    //Same as nextFocus
    let editor = atom.workspace.getActiveTextEditor();
    let cursor = editor.getCursorScreenPosition();
    let path = editor.getPath();
    let point = this.closerLastRange(path, cursor.row, cursor.column);

    if (point != null) {
      editor.setCursorScreenPosition([point.line, point.character]);
    }
  }

  /* A couple of functions to deal with ranges */
  rangewithin(dvpath, dvRS, dvRE, dvCS, dvCE, apath, aR, aC) {
    /*This function  return a boolean, his value value is true when the cursor symbolised by aRow and aColumn is within the range
    defined by the dvRowStart, dvRowEnd, dvColumnStart and dvColumnEnd. (and of course on the same file)
    */
    if (dvpath != apath) {
      return false;
    }
    if (dvRS > aR) {
      return false;
    }
    if (dvRE < aR) {
      return false;
    }
    if (dvRS === aR && dvCS > aC) {
      return false;
    }
    if (dvRE === aR && dvCE < aC) {
      return false;
    }

    return true;
  }

  closerLastRange(path, row, column) {
    let i;
    let candidate = [];
    let min;
    let min_index;

    //We compute the distance between each FocusView and the cursor and gather the results in an array candidate
    for (i = 0; i < this.FocusView.length; i++) {
      if (this.FocusView[i].path === path) {
        if (this.FocusView[i].range.end.line < row) {
          let travel = row - this.FocusView[i].range.end.line;
          candidate.push({
            distance: travel,
            index: i
          });
        } else if (this.FocusView[i].range.end.line === row) {
          if (this.FocusView[i].range.end.character < column) {
            let travel = (column - this.FocusView[i].range.end.character) / 10;
            candidate.push({
              distance: travel,
              index: i
            });
          }
        }
      }
    }
    //We return the smallest distance
    if (candidate.length > 0) {
      min = candidate[0].distance;
      min_index = candidate[0].index;
      for (i = 1; i < candidate.length; i++) {
        if (candidate[i].distance < min) {
          min = candidate[i].distance;
          min_index = candidate[i].index;
        }
      }
      return this.FocusView[min_index].range.end;
    }
    //IN case there is no next FocusView
    return null;
  }

  //Exactely the same as closerNextRange except some details
  closerNextRange(path, row, column) {
    let i;
    let candidate = [];
    let min;
    let min_index;

    for (i = 0; i < this.FocusView.length; i++) {
      if (this.FocusView[i].path === path) {
        if (this.FocusView[i].range.start.line > row) {
          let travel = this.FocusView[i].range.start.line - row;
          candidate.push({
            distance: travel,
            index: i
          });
        } else if (this.FocusView[i].range.start.line === row) {
          if (this.FocusView[i].range.start.character > column) {
            let travel =
              (this.FocusView[i].range.start.character - column) / 10;
            candidate.push({
              distance: travel,
              index: i
            });
          }
        }
      }
    }

    if (candidate.length > 0) {
      min = candidate[0].distance;
      min_index = candidate[0].index;
      for (i = 1; i < candidate.length; i++) {
        if (candidate[i].distance < min) {
          min = candidate[i].distance;
          min_index = candidate[i].index;
        }
      }
      return this.FocusView[min_index].range.end;
    }

    return null;
  }

  ////////////// A LIST OF OLD FUNCTIONS ////////////////////////
  /*
  // A function to update the the goals list when it's needed
  updateSubProof() {
    //This function was created to handle a tree view and need to be rewritten
    let j;
    var new_list_of_proof = document.createElement("ol");

    for (j = 0; j < this.data_proof_array; j++) {
      var souspreuvre = document.createElement("li");
      souspreuvre.classList.add("list-nested-item");
      souspreuvre.setAttribute("id", this.data_proof_array[i].id);

      // On crée le sous arbre
      var sousarbre = document.createElement("ul");
      sousarbre.classList.add("entries", "list-tree");

      var div = document.createElement("div");
      div.classList.add("header", "list-item");

      var span = document.createElement("span");
      span.innerText = this.data_proof_array[i].name;
      div.appendChild(span);

      // On ajoute les elements à la preuve
      souspreuvre.appendChild(div);
      souspreuvre.appendChild(sousarbre);

      if (this.data_proof_array[i].parent_id === 0) {
        new_list_of_proof.appendChild(souspreuvre);
        span.classList.add("icon", "icon-key");
      } else {
        span.classList.add("icon", "icon-link");
        let parent_tree = document.getElementById(
          this.data_proof_array[i].parent_id
        );
        let children = parent_tree.childNodes;
        let list_tree = children.item(1);
        list_tree.appendChild(souspreuvre);
      }
    }

    this.list_of_proof = this.element.replaceChild(
      new_list_of_proof,
      this.list_of_proof
    );
  }

  // A function to update the the hypothesis list when it's needed
  updateHypothesis(hypothesis_array) {
    //This function was created to handle a tree view and need to be rewritten
    let new_list_of_hypothesis = document.createElement("ol");

    let i;
    for (i = 0; i < hypothesis_array.length; i++) {
      var hypothesis = document.createElement("li");
      hypothesis.classList.add("list-item");

      var span = document.createElement("span");
      span.classList.add("icon", "icon-bookmark");
      span.innerText = hypothesis_array[i];
      hypothesis.appendChild(span);
      new_list_of_hypothesis.append(hypothesis);
    }

    this.list_of_hypothesis = this.element.replaceChild(
      new_list_of_hypothesis,
      this.list_of_hypothesis
    );
  }

  // Not usefull yet, may be useless
  cursor_tree_update(id) {
    //This function was created to handle a tree view and need to be rewritten
    let to_colorize = document.getElementById(id);

    let children = to_colorize.childNodes;
    let div = children.item(0);
    let span = div.childNodes.item(0);

    span.classList.remove("icon-key", "icon-link");
    span.classList.add("icon-eye-watch");
  }
*/
}

exports.default = DeduktiEditorView;
