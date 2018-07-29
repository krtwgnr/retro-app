import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Typography, Button } from 'material-ui';
import { FormattedMessage } from 'react-intl';
import PlaylistAdd from 'material-ui-icons/PlaylistAdd';
import Card from '../../containers/Retro/Card';
import { QUERY_ERROR_KEY, queryFailed, QueryShape } from '../../services/websocket/query';

class Column extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      areCardsVisible: true
    };
  }

  componentWillReceiveProps(nextProps) {
    const { addCardQuery, addMessage } = this.props;
    const { addCardQuery: nextAddCardQuery } = nextProps;
    if (queryFailed(addCardQuery, nextAddCardQuery)) {
      addMessage(nextAddCardQuery[QUERY_ERROR_KEY]);
    }
  }

  getCards = () => {
    const { cards, column, isSortVotesEnabled, querySearch } = this.props;
    const parsedQuerySearch = querySearch.length > 1 ? querySearch : '';
    const parsedCards = isSortVotesEnabled ? (
      cards.filter(card => column.id === card.columnId && card.text.indexOf(parsedQuerySearch) > -1)
        .sort((a, b) => b.votes.length - a.votes.length)
    ) : (
      cards.filter(card => column.id === card.columnId && card.text.indexOf(parsedQuerySearch) > -1)
    );
    return parsedCards.map(card => (
      <Card
        card={card}
        key={card.id}
        onCardDragStart={this.props.onCardDragStart}
        onCardDrop={this.props.onCardDrop}
      />
    ));
  };

  handleTextChange = (e) => {
    this.setState({ text: e.target.value });
  };

  addCard = () => {
    const { socket } = this.context;
    const { text } = this.state;
    const { column: { id }, addCard } = this.props;

    addCard(socket, id, text);
    this.setState({ text: '' });
  };

  toggleCardsVisible = () => this.setState({
    areCardsVisible: !this.state.areCardsVisible
  });

  render() {
    const { column, classes } = this.props;
    const parsedColumns = this.state.areCardsVisible && this.getCards();
    return (
      <div
        className={classes.column}
        onDragOver={e => e.preventDefault()}
        onDrop={() => this.props.onColumnDrop(column.id)}
      >
        <div className={classes.header}>
          <Typography
            type="headline"
            className={classes.columnTitle}
            onDoubleClick={this.startEditing}
          >{column.name}
          </Typography>
          <IconButton className={classes.addCardIcon} onClick={this.addCard}>
            <PlaylistAdd className={classes.actionIcon} />
          </IconButton>
          <Button
            size="medium"
            color={this.state.areCardsVisible ? 'default' : 'primary'}
            onClick={this.toggleCardsVisible}
          >
            <FormattedMessage id="retro.toggle-cards-visible" />
          </Button>
        </div>
        {parsedColumns}
      </div>
    );
  }
}

Column.contextTypes = {
  socket: PropTypes.object.isRequired
};

Column.propTypes = {
  // Values
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  cards: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    columnId: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired,
  querySearch: PropTypes.string.isRequired,
  isSortVotesEnabled: PropTypes.bool.isRequired,
  // Functions
  addCard: PropTypes.func.isRequired,
  addMessage: PropTypes.func.isRequired,
  onCardDragStart: PropTypes.func.isRequired,
  // Queries
  addCardQuery: PropTypes.shape(QueryShape).isRequired,
  // Styles
  classes: PropTypes.shape({
    column: PropTypes.string.isRequired,
    columnTitle: PropTypes.string.isRequired,
    addCardIcon: PropTypes.string.isRequired,
    addCardContainer: PropTypes.string.isRequired
  }).isRequired,
  onColumnDrop: PropTypes.func.isRequired,
  onCardDrop: PropTypes.func.isRequired
};

export default Column;
