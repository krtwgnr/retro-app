import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  Tooltip,
  Typography
} from 'material-ui';
import TextField from 'material-ui/TextField';
import { CircularProgress } from 'material-ui/Progress';
import Dialog, { DialogActions, DialogTitle } from 'material-ui/Dialog';
import { FormattedMessage } from 'react-intl';
import {
  QUERY_ERROR_KEY,
  QUERY_STATUS_FAILURE,
  QUERY_STATUS_KEY,
  QUERY_STATUS_SUCCESS,
  queryFailed,
  QueryShape,
  querySucceeded
} from '../../services/websocket/query';
import Column from '../../containers/Retro/Column';
import Steps from '../../containers/Retro/Steps';
import { initialsOf } from '../../services/utils/initials';

class Retro extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSortVotesEnabled: false,
      isCardJoinStarted: false,
      cardPendingEdit: {},
      draggedCard: {},
      querySearch: ''
    };
  }

  componentWillMount() {
    this.joinRetro();
  }

  componentWillReceiveProps(nextProps) {
    const { addColumnQuery, connectQuery, addMessage } = this.props;
    const { addColumnQuery: nextAddColumnQuery, connectQuery: nextConnectQuery } = nextProps;
    if (queryFailed(addColumnQuery, nextAddColumnQuery)) {
      addMessage(nextAddColumnQuery[QUERY_ERROR_KEY]);
    }
    if (querySucceeded(connectQuery, nextConnectQuery)) {
      this.joinRetro();
    }
  }

  onColumnDrop = (id) => {
    const { socket } = this.context;
    const { editCard } = this.props;
    if (this.state.draggedCard.columnId !== id) {
      editCard(socket, { id: this.state.draggedCard.id, columnId: id });
      this.setState({ draggedCard: {} });
    }
  };

  onCardDrop = card => this.setState({
    cardPendingEdit: card,
    isCardJoinStarted: true
  });

  onCardDragStart = card => this.setState({
    draggedCard: card
  });

  cancelCardsJoin = () => this.setState({
    isCardJoinStarted: false,
    cardPendingEdit: {}
  });

  changeQueryValue = event => this.setState({
    querySearch: event.target.value
  });

  joinCards = () => {
    const { socket } = this.context;
    const { editCard, removeCard } = this.props;
    const text = `${this.state.cardPendingEdit.text}\n${this.state.draggedCard.text}`;
    removeCard(socket, this.state.draggedCard.id);
    editCard(socket, { id: this.state.cardPendingEdit.id, text });
    this.setState({
      isCardJoinStarted: false,
      cardPendingEdit: {},
      draggedCard: {}
    });
  };

  toggleSortVotes = () => this.setState({
    isSortVotesEnabled: !this.state.isSortVotesEnabled
  });

  joinRetro = () => {
    const { joinRetro, match: { params: { retroShareId } } } = this.props;
    const { socket } = this.context;
    joinRetro(socket, retroShareId);
  };

  render() {
    const {
      step,
      classes,
      columns,
      users,
      history,
      joinRetroQuery: {
        [QUERY_STATUS_KEY]: joinStatus,
        [QUERY_ERROR_KEY]: joinError
      }
    } = this.props;
    const buttonVote = step === 'vote' && (
      <Button
        raised
        size="medium"
        color={this.state.isSortVotesEnabled ? 'primary' : 'default'}
        onClick={this.toggleSortVotes}
      >
        <FormattedMessage id="retro.sort-votes-column" />
      </Button>
    );
    switch (joinStatus) {
      case QUERY_STATUS_SUCCESS:
        return (
          <div className={classes.root}>
            <Steps />
            <div className={classes.toolbar}>
              {buttonVote}
              <TextField
                id="search"
                label={<FormattedMessage id="retro.label-query-search" />}
                value={this.state.querySearch}
                onChange={e => this.changeQueryValue(e)}
              />
            </div>
            <div className={classes.columns}>
              {columns.map(column => (
                <Column
                  key={column.id}
                  column={column}
                  onColumnDrop={this.onColumnDrop}
                  onCardDrop={this.onCardDrop}
                  onCardDragStart={this.onCardDragStart}
                  querySearch={this.state.querySearch}
                  isSortVotesEnabled={this.state.isSortVotesEnabled}
                />
              ))}
            </div>
            <div className={classes.users}>
              {Object.values(users).map(({ id, name }) => (
                <Tooltip key={id} title={name} placement="left">
                  <Avatar
                    alt={name}
                    className={classes.avatar}
                  >
                    {initialsOf(name)}
                  </Avatar>
                </Tooltip>
              ))}
            </div>
            <Dialog onClose={this.cancelCardsJoin} open={this.state.isCardJoinStarted}>
              <DialogTitle>
                <FormattedMessage id="retro.join-cards" />
              </DialogTitle>
              <DialogActions>
                <Button onClick={this.cancelCardsJoin} color="primary">
                  <FormattedMessage id="retro.join-cards-no" />
                </Button>
                <Button onClick={this.joinCards} color="primary">
                  <FormattedMessage id="retro.join-cards-ok" />
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        );
      case QUERY_STATUS_FAILURE:
        return (
          <div className={classes.root}>
            <Card className={classes.messageCard}>
              <Typography type="headline">Error</Typography>
              <CardContent>
                <Typography>{joinError}</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => history.goBack()}>Back</Button>
              </CardActions>
            </Card>
          </div>
        );
      default:
        return (
          <div className={classes.root}>
            <Card className={classes.messageCard}>
              <CircularProgress color="primary" />
            </Card>
          </div>
        );
    }
  }
}

Retro.contextTypes = {
  socket: PropTypes.object.isRequired
};

Retro.propTypes = {
  // Values
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      retroShareId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  })).isRequired,
  users: PropTypes.object.isRequired,
  step: PropTypes.string,
  // Queries
  connectQuery: PropTypes.shape(QueryShape).isRequired,
  joinRetroQuery: PropTypes.shape(QueryShape).isRequired,
  addColumnQuery: PropTypes.shape(QueryShape).isRequired,
  // Functions
  joinRetro: PropTypes.func.isRequired,
  addMessage: PropTypes.func.isRequired,
  editCard: PropTypes.func.isRequired,
  removeCard: PropTypes.func.isRequired,
  // Styles
  classes: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    root: PropTypes.string.isRequired,
    messageCard: PropTypes.string.isRequired,
    columns: PropTypes.string.isRequired,
    users: PropTypes.string.isRequired,
    hidden: PropTypes.string.isRequired
  }).isRequired
};

Retro.defaultProps = {
  step: ''
};

export default Retro;
