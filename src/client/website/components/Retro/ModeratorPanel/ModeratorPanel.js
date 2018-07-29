import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Button } from 'material-ui';
import { FormattedMessage } from 'react-intl';
import { CSVLink } from 'react-csv';
import { steps } from '../../../components/Retro/Steps';
import RemainingVotes from '../../../containers/RemainingVotes';

class ModeratorPanel extends Component {
  exportCardsToSvg = () => {
    const { cards } = this.props;
    const parsedCards = [];
    cards.forEach(card => (
      parsedCards.push([card.text])
    ));
    return parsedCards;
  };
  handleNextStep = currentKey => () => {
    const { socket } = this.context;
    const { changeStep } = this.props;
    const index = steps.findIndex(s => s.key === currentKey);
    if (index < 3) {
      const { key } = steps[index + 1];
      changeStep(socket, key);
    }
  };

  handlePreviousStep = currentKey => () => {
    const { socket } = this.context;
    const { changeStep } = this.props;
    const index = steps.findIndex(s => s.key === currentKey);
    if (index > 0) {
      const { key } = steps[index - 1];
      changeStep(socket, key);
    }
  };

  render() {
    const { isScrumMaster, retroStep, classes } = this.props;
    return (
      <div>
        {isScrumMaster &&
          <div className={classes.appBarContainer}>
            <AppBar
              className={classes.appBar}
              position="static"
              color="default"
            >
              <Toolbar>
                <div className={classes.leftDiv}>
                  <div className="logotype">
                    <FormattedMessage id="retro.moderator-panel" />
                  </div>
                  {retroStep === 'vote' && <RemainingVotes />}
                </div>
                <div className={classes.actionButtons}>
                  <CSVLink data={this.exportCardsToSvg()} filename="action-points.csv">
                    <Button
                      raised
                      size="medium"
                      color="primary"
                      className={classes.button}
                    >
                      <FormattedMessage id="retro.download-action-points" />
                    </Button>
                  </CSVLink>
                  {steps.findIndex(s => s.key === retroStep) > 0 &&
                    <Button
                      raised
                      size="medium"
                      color="primary"
                      className={classes.button}
                      onClick={this.handlePreviousStep(retroStep)}
                    >
                      <FormattedMessage id="retro.previous-step" />
                    </Button>
                  }
                  {steps.findIndex(s => s.key === retroStep) < 3 &&
                    <Button
                      raised
                      size="medium"
                      color="primary"
                      className={classes.button}
                      onClick={this.handleNextStep(retroStep)}
                    >
                      <FormattedMessage id="retro.next-step" />
                    </Button>
                  }
                </div>
              </Toolbar>
            </AppBar>
          </div>
        }
      </div>
    );
  }
}

ModeratorPanel.defaultProps = {
  retroStep: ''
};

ModeratorPanel.propTypes = {
  // Values
  cards: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    columnId: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired,
  isScrumMaster: PropTypes.bool.isRequired,
  changeStep: PropTypes.func.isRequired,
  retroStep: PropTypes.string,
  // Styles
  classes: PropTypes.shape({
    appBarContainer: PropTypes.string.isRequired,
    appBar: PropTypes.string.isRequired,
    actionButtons: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired
  }).isRequired
};

ModeratorPanel.contextTypes = {
  socket: PropTypes.object.isRequired
};

export default ModeratorPanel;
