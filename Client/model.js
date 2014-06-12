////////// Shared code (client and server) //////////

Games = new Meteor.Collection('games');

Players = new Meteor.Collection('players');

Documents = new Meteor.Collection('documents');

Meteor.methods({
  score_word: function (word_id) {
    check(word_id, String);
    var word = Words.findOne(word_id);
    var game = Games.findOne(word.game_id);

    // client and server can both check that the game has time remaining, and
    // that the word is at least three chars, isn't already used, and is
    // possible to make on the board.
    if (game.clock === 0
        || !word.word
        || word.word.length < 3
        || Words.find({game_id: word.game_id, word: word.word}).count() > 1
        || paths_for_word(game.board, word.word).length === 0) {
      Words.update(word._id, {$set: {score: 0, state: 'bad'}});
      return;
    }

    // now only on the server, check against dictionary and score it.
    if (Meteor.isServer) {
      if (_.has(DICTIONARY, word.word.toLowerCase())) {
        var score = Math.pow(2, word.word.length - 3);
        Words.update(word._id, {$set: {score: score, state: 'good'}});
      } else {
        Words.update(word._id, {$set: {score: 0, state: 'bad'}});
      }
    }
  }
});


if (Meteor.isServer) {
  DICTIONARY = {};
  _.each(Assets.getText("enable2k.txt").split("\n"), function (line) {
    // Skip blanks and comment lines
    if (line && line.indexOf("//") !== 0) {
      DICTIONARY[line] = true;
    }
  });

  // publish all the non-idle players.
  Meteor.publish('players', function () {
    return Players.find({idle: false});
  });

  // publish single games
  Meteor.publish('games', function (id) {
    check(id, String);
    return Games.find({_id: id});
  });

  // publish all my words and opponents' words that the server has
  // scored as good.
  Meteor.publish('words', function (game_id, player_id) {
    check(game_id, String);
    check(player_id, String);
    return Words.find(
      {$and: [
        {game_id: game_id},
        {$or: [
          {state: 'good'},
          {player_id: player_id}]}]});
  });

  Meteor.publish('documents', function(documentName) {
    console.log("FETCHING DOCUMENT: " + documentName);
    var doc = Documents.find({name:documentName});
    if (doc.count()==0) {
      console.log("CREATING NEW DOCUMENT");
      Documents.insert({name:documentName, text:"This is a test"});
      doc = Documents.find({name:documentName});
    } else if(doc.count()>1) {
      while (doc.count()>1) {
        Documents.remove(doc.fetch()[0]._id);
        doc = Documents.find({name:documentName});
      }
    }
    if (doc.count()==0) {
      console.log("OOPS");
    }
    console.log(doc.count());
    return doc;
  });

  Players.allow({
    insert: function(userId, doc) {
      return true;
    },
    update: function(userId, doc, fieldNames, modifier) {
      return true;
    },
    remove: function(userId, doc) {
      return true;
    }
  });

  Documents.allow({
    insert: function(userId, doc) {
      return true;
    },
    update: function(userId, doc, fieldNames, modifier) {
      return true;
    },
    remove: function(userId, doc) {
      return true;
    }
  });
}
